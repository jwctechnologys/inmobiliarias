"""Serializadores de casas, fotos y videos."""
from rest_framework import serializers
from inmobiliarias.vacios import VaciosANoneMixin

from inmuebles.models import ConsultaInmueble, Imagen_casa_arrendar, SolicitudPublicacion, Video_Casa, arrendar
from inmuebles.permisos import puede_gestionar
from inmuebles.utilidades import slug_de


class InmuebleSerializer(serializers.ModelSerializer):
    class Meta:
        model = arrendar
        fields = '__all__'
        depth = 3


class CasaSerializer(VaciosANoneMixin, serializers.ModelSerializer):
    # Solo lo ven el administrador y el propietario de la casa; para el resto (incluido el publico) no se envia.
    PRIVADOS = ('propietario', 'matriculaInmobiliaria', 'solicitudes_count', 'notas_internas')

    solicitudes_count = serializers.IntegerField(source="solicitudes.count", read_only=True)
    class Meta:
        model = arrendar
        fields = '__all__'

    def to_representation(self, instance):
        datos = super().to_representation(instance)
        peticion = self.context.get('request')
        # Sin peticion (uso interno, p. ej. al crear) no se oculta nada; con peticion solo ve todo quien gestiona la casa
        if peticion is not None and not puede_gestionar(peticion.user, instance):
            for campo in self.PRIVADOS:
                datos.pop(campo, None)
        return datos

    def validate(self, datos):
        # Los "si hay / no hay" de siempre se mantienen en sintonia con las cantidades nuevas
        for cantidad, existe in (('num_habitaciones', 'habitaciones'), ('num_banos', 'baños'), ('num_parqueaderos', 'garage')):
            if (datos.get(cantidad) or 0) > 0:
                datos[existe] = True
        return super().validate(datos)


class ImagenCasaArrendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Imagen_casa_arrendar
        fields = '__all__'


class VideoCasaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video_Casa
        fields = ['id', 'arrendar', 'video_archivo', 'descripcion']


class SolicitudPublicacionSerializer(VaciosANoneMixin, serializers.ModelSerializer):
    """Lo que envia el formulario publico "Publica tu propiedad". El estado y las notas son solo del equipo."""
    FOTO_MAX_MB = 5

    class Meta:
        model = SolicitudPublicacion
        fields = ['nombre', 'telefono', 'correo', 'tipoInmueble', 'modalidad', 'direccion', 'barrio', 'ciudad',
                  'precio', 'descripcion', 'foto', 'acepta_datos']

    def validate_acepta_datos(self, valor):
        if not valor:
            raise serializers.ValidationError('Debes autorizar el uso de tus datos para que podamos contactarte.')
        return valor

    def validate_nombre(self, valor):
        valor = valor.strip()
        if len(valor) < 3:
            raise serializers.ValidationError('Escribe tu nombre.')
        return valor

    def validate_telefono(self, valor):
        solo_digitos = ''.join(c for c in valor if c.isdigit())
        if len(solo_digitos) < 7:
            raise serializers.ValidationError('Escribe un teléfono válido.')
        return valor.strip()

    def validate_precio(self, valor):
        if valor is not None and valor < 0:
            raise serializers.ValidationError('El precio no puede ser negativo.')
        return valor

    def validate_foto(self, foto):
        if foto and foto.size > self.FOTO_MAX_MB * 1024 * 1024:
            raise serializers.ValidationError(f'La foto no puede pesar más de {self.FOTO_MAX_MB} MB.')
        return foto


# ----------------------------------------------------------------------------------------------------------------
# API publica de solo lectura: lo que ve cualquier visitante del portal (nunca datos del propietario ni internos)
# ----------------------------------------------------------------------------------------------------------------
def _cantidad(valor, observacion):
    """Cantidad de un espacio: el campo numerico y, si esta vacio, el numero con el que empieza la observacion."""
    if valor:
        return valor
    texto = (observacion or '').strip()
    digitos = ''
    for caracter in texto:
        if not caracter.isdigit():
            break
        digitos += caracter
    return int(digitos) if digitos and len(digitos) <= 2 else None


class InmueblePublicoSerializer(serializers.ModelSerializer):
    """Tarjeta del inmueble (listados y mapa)."""
    titulo = serializers.SerializerMethodField()
    slug = serializers.SerializerMethodField()
    precio = serializers.SerializerMethodField()
    destacada = serializers.SerializerMethodField()
    fotoPrincipal = serializers.ImageField(read_only=True)
    habitaciones = serializers.SerializerMethodField()
    banos = serializers.SerializerMethodField()
    parqueaderos = serializers.SerializerMethodField()

    class Meta:
        model = arrendar
        fields = ['id', 'titulo', 'slug', 'modalidad', 'precio', 'tipoInmueble', 'usoInmueble', 'direccion', 'barrio', 'ciudad',
                  'fotoPrincipal', 'latitud', 'longitud', 'habitaciones', 'banos', 'parqueaderos', 'area', 'estrato',
                  'estado_inmueble', 'verificada', 'destacada', 'fecha']

    def get_titulo(self, casa):
        tipo = casa.tipoInmueble or 'Inmueble'
        oferta = 'en venta' if casa.modalidad == 'venta' else 'en arriendo'
        lugar = casa.barrio or casa.ciudad
        return f"{tipo} {oferta}" + (f" en {lugar}" if lugar else '')

    def get_slug(self, casa):
        return slug_de(self.get_titulo(casa))

    def get_precio(self, casa):
        return casa.precioVenta if casa.modalidad == 'venta' else casa.canonmensual

    def get_destacada(self, casa):
        from django.utils import timezone
        return bool(casa.destacada and (casa.destacada_hasta is None or casa.destacada_hasta >= timezone.localdate()))

    def get_habitaciones(self, casa):
        return _cantidad(casa.num_habitaciones, casa.observacion_habitaciones) if casa.habitaciones or casa.num_habitaciones else None

    def get_banos(self, casa):
        return _cantidad(casa.num_banos, casa.observacion_baños) if casa.baños or casa.num_banos else None

    def get_parqueaderos(self, casa):
        return _cantidad(casa.num_parqueaderos, casa.observacion_garage) if casa.garage or casa.num_parqueaderos else None


class InmueblePublicoDetalleSerializer(InmueblePublicoSerializer):
    """Ficha completa: descripcion, comodidades, servicios, fotos y videos."""
    comodidades = serializers.SerializerMethodField()
    servicios = serializers.SerializerMethodField()
    imagenes = serializers.SerializerMethodField()
    videos = serializers.SerializerMethodField()

    class Meta(InmueblePublicoSerializer.Meta):
        fields = InmueblePublicoSerializer.Meta.fields + [
            'descripcion', 'condiciones', 'con_administracion', 'antiguedad', 'deposito', 'canonmensual', 'precioVenta',
            'comodidades', 'servicios', 'imagenes', 'videos']

    _COMODIDADES = [
        ('habitaciones', 'Habitaciones', 'num_habitaciones', 'observacion_habitaciones'),
        ('baños', 'Baños', 'num_banos', 'observacion_baños'),
        ('cocina', 'Cocina', None, 'observacion_cocina'),
        ('garage', 'Parqueadero', 'num_parqueaderos', 'observacion_garage'),
        ('sala', 'Sala', None, 'observacion_sala'),
        ('comedor', 'Comedor', None, 'observacion_comedor'),
        ('patio', 'Patio', None, 'observacion_patio'),
        ('tanquesubterraneo', 'Tanque subterráneo', None, 'observacion_tanquesubterraneo'),
    ]
    _SERVICIOS = [('ser_agua', 'Agua'), ('ser_energia', 'Energía'), ('ser_gas_domiciliario', 'Gas domiciliario'), ('ser_bioagricola', 'Bioagrícola')]

    def get_comodidades(self, casa):
        salida = []
        for campo, etiqueta, numerico, observacion in self._COMODIDADES:
            if not getattr(casa, campo) and not (numerico and getattr(casa, numerico)):
                continue
            cantidad = _cantidad(getattr(casa, numerico) if numerico else None, getattr(casa, observacion))
            nota = (getattr(casa, observacion) or '').strip()
            if cantidad is not None:  # "3 con closet" -> la nota es "con closet"
                nota = nota.lstrip('0123456789').strip() if nota[:1].isdigit() else nota
            salida.append({'clave': campo, 'etiqueta': etiqueta, 'cantidad': cantidad, 'nota': nota})
        return salida

    def get_servicios(self, casa):
        return [etiqueta for campo, etiqueta in self._SERVICIOS if getattr(casa, campo)]

    def get_imagenes(self, casa):
        peticion = self.context.get('request')
        return [{'id': i.id, 'imagen': peticion.build_absolute_uri(i.imagen.url) if peticion and i.imagen.url.startswith('/') else i.imagen.url,
                 'descripcion': i.descripcion or ''} for i in casa.imagen_casa_arrendar_set.all()]

    def get_videos(self, casa):
        peticion = self.context.get('request')
        return [{'id': v.id, 'video': peticion.build_absolute_uri(v.video_archivo.url) if peticion and v.video_archivo.url.startswith('/') else v.video_archivo.url,
                 'descripcion': v.descripcion or ''} for v in casa.video_casa_set.all()]


class ConsultaInmuebleSerializer(serializers.ModelSerializer):
    """Lo que envia el formulario de contacto / visita de la ficha. El estado y las notas son solo del equipo."""

    class Meta:
        model = ConsultaInmueble
        fields = ['tipo', 'nombre', 'telefono', 'correo', 'mensaje', 'fecha_visita', 'franja_visita', 'acepta_datos']

    def validate_nombre(self, valor):
        valor = valor.strip()
        if len(valor) < 3:
            raise serializers.ValidationError('Escribe tu nombre.')
        return valor

    def validate_telefono(self, valor):
        if len(''.join(c for c in valor if c.isdigit())) < 7:
            raise serializers.ValidationError('Escribe un teléfono válido.')
        return valor.strip()

    def validate_acepta_datos(self, valor):
        if not valor:
            raise serializers.ValidationError('Debes autorizar el uso de tus datos para que podamos contactarte.')
        return valor

    def validate_fecha_visita(self, valor):
        from django.utils import timezone
        if valor and valor < timezone.localdate():
            raise serializers.ValidationError('Elige una fecha de hoy en adelante.')
        return valor

    def validate(self, datos):
        if datos.get('tipo') == 'visita' and not datos.get('fecha_visita'):
            raise serializers.ValidationError({'fecha_visita': 'Elige el día en que quieres visitar el inmueble.'})
        return datos
