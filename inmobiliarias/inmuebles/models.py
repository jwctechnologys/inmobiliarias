from django.core.validators import MaxValueValidator, MinValueValidator, RegexValidator
from django.db import models

from usuarios.models import propietario

from .utilidades import comprimir_imagen, parsear_coordenadas


class Casa(models.Model):
    id = models.AutoField(primary_key=True)
    propietario = models.ForeignKey (propietario ,on_delete=models.CASCADE)
    matriculaInmobiliaria =models.CharField(blank=True, max_length=100)
    tipoInmueble = models.CharField(blank=True, max_length=100) #Casa, Apartamento, Habitacion, Local
    usoInmueble = models.CharField(blank=True, max_length=100) #Vivienda, Comercial
    direccion = models.CharField(max_length=100)
    barrio = models.CharField(blank=True, max_length=100)
    ciudad = models.CharField(blank=True, max_length=50)
    # Ubicacion exacta para el mapa de la pagina de inicio. Es lo que Google Maps copia al tocar un punto: "4.1295747, -73.6220074"
    coordenadas = models.CharField(
        blank=True, max_length=40,
        validators=[RegexValidator(r'^\s*-?\d{1,2}(?:\.\d+)?\s*,\s*-?\d{1,3}(?:\.\d+)?\s*$', 'Escribe latitud y longitud separadas por coma, por ejemplo 4.1295747, -73.6220074')],
        help_text='Latitud y longitud tal como las copia Google Maps (clic derecho sobre el punto). Ej: 4.1295747, -73.6220074',
    )
    # Datos para buscar y filtrar (los de "si hay / no hay" de abajo se conservan por compatibilidad)
    num_habitaciones = models.PositiveSmallIntegerField(null=True, blank=True)
    num_banos = models.PositiveSmallIntegerField(null=True, blank=True)
    num_parqueaderos = models.PositiveSmallIntegerField(null=True, blank=True)
    area = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text='Area construida en m2')
    estrato = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(6)])
    estado_inmueble = models.CharField(max_length=12, blank=True, choices=[('nuevo', 'Nuevo'), ('usado', 'Usado'), ('planos', 'Sobre planos')])
    antiguedad = models.PositiveSmallIntegerField(null=True, blank=True, help_text='Años de construido')
    # Salen de "coordenadas" al guardar: asi el mapa y las busquedas por zona no tienen que interpretar texto
    latitud = models.FloatField(null=True, blank=True, editable=False)
    longitud = models.FloatField(null=True, blank=True, editable=False)
    verificada = models.BooleanField(default=False, help_text='El equipo verifico el inmueble y sus datos')
    destacada = models.BooleanField(default=False, help_text='Aparece primero y con distintivo en la pagina de inicio')
    destacada_hasta = models.DateField(null=True, blank=True, help_text='Vacio = sin fecha de vencimiento')
    vistas = models.PositiveIntegerField(default=0, editable=False)
    # Como se ofrece el inmueble en la pagina de inicio. Las casas ya registradas quedan "en arriendo".
    modalidad = models.CharField(max_length=10, choices=[('arriendo', 'En arriendo'), ('venta', 'En venta')], default='arriendo')
    precioVenta = models.IntegerField(blank=True, null=True, help_text='Solo si se ofrece en venta')
    descripcion = models.TextField(blank=True,null=True)  #venta, arriendo, arrendada, vendida
    condiciones = models.TextField(blank=True,null=True)  #venta, arriendo, arrendada, vendida
    con_administracion= models.BooleanField(default=False)
    fotoPrincipal= models.ImageField(upload_to='media/', null=True)
    publicar = models.BooleanField(default=False)  #
    arrendada = models.BooleanField(default=False)
    solicitudAceptada = models.BooleanField(default=False)
    conCodeudor = models.BooleanField(default=True)  #Activo si codeusor, false Alternativo
    fecha = models.DateTimeField(null=True, blank=True)

    class Meta:
       abstract = True

    def save(self, *args, **kwargs):
        punto = parsear_coordenadas(self.coordenadas)
        self.latitud, self.longitud = punto if punto else (None, None)
        comprimir_imagen(self.fotoPrincipal)
        super().save(*args, **kwargs)


class arrendar(Casa):
    canonmensual = models.IntegerField(default=0)  # 0 cuando el inmueble se ofrece solo en venta
    observacion_canonmensual = models.TextField(blank=True)
    deposito = models.IntegerField(blank=True, null=True)
    observacion_deposito = models.TextField(blank=True)
    sala= models.BooleanField(default=False)
    observacion_sala = models.TextField(blank=True)
    comedor= models.BooleanField(default=False)
    observacion_comedor = models.TextField(blank=True)
    cocina= models.BooleanField(default=False)
    observacion_cocina = models.TextField(blank=True)
    habitaciones= models.BooleanField(default=False)
    observacion_habitaciones = models.TextField(blank=True)
    baños= models.BooleanField(default=False)
    observacion_baños = models.TextField(blank=True)
    patio= models.BooleanField(default=False)
    observacion_patio = models.TextField(blank=True)
    garage= models.BooleanField(default=False)
    observacion_garage = models.TextField(blank=True)
    tanquesubterraneo= models.BooleanField(default=False)
    observacion_tanquesubterraneo = models.TextField(blank=True)
    ser_agua= models.BooleanField(default=False)
    observacion_ser_agua = models.TextField(blank=True)
    ser_energia= models.BooleanField(default=False)
    observacion_ser_energia = models.TextField(blank=True)
    ser_gas_domiciliario= models.BooleanField(default=False)
    observacion_ser_gas_domiciliario = models.TextField(blank=True)
    ser_bioagricola= models.BooleanField(default=False)
    observacion_ser_bioagricola = models.TextField(blank=True) 
    otros =  models.TextField(max_length=100,blank=True)
    #def __str__(self):
    #   return f"{self.direccion} - {self.propietario.username}"
    class Meta:
        verbose_name = "Casa registrada para arrendar"
        verbose_name_plural = "Casas registradas para arrendar"


class Imagen_casa_arrendar(models.Model):
    arrendar = models.ForeignKey(arrendar, on_delete=models.CASCADE)
    descripcion = models.TextField(blank=True,null=True) 
    imagen = models.ImageField(upload_to='media/casa/imagenes')

    def save(self, *args, **kwargs):
        comprimir_imagen(self.imagen)
        super().save(*args, **kwargs)
    #def __str__(self):
     #  return f"{self.arrendar.direccion} - {self.arrendar.propietario.username}"
    class Meta:
        verbose_name = "Mas fotos de las casas registradas"
        verbose_name_plural = "Mas fotos de las casas registradas"


class Video_Casa(models.Model): 
    arrendar = models.ForeignKey(arrendar, on_delete=models.CASCADE)
    descripcion = models.TextField(blank=True,null=True) 
    video_archivo = models.FileField(upload_to='casa/videos') 
    def __str__(self):
        # Devuelve una descripción significativa del objeto
        return self.descripcion or f"Video {self.id}"


class arriendo(models.Model):
    arrendar = models.ForeignKey(arrendar, on_delete=models.CASCADE)
    #arrendatario = models.ForeignKey (arrendatario ,on_delete=models.CASCADE)
    #coarrendatario = models.ForeignKey (coarrendatario ,on_delete=models.CASCADE)

    solicitud_form_orig= models.BooleanField(default=False)
    Inventario= models.BooleanField(default=False)
    Registro_fotografico= models.BooleanField(default=False)
    Visita_verificacion= models.BooleanField(default=False)
    Verificacion_pagos_servicios= models.BooleanField(default=False)
    Notificacion_renova_cancela= models.BooleanField(default=False)
    Documentos_ident_arrendatario= models.BooleanField(default=False)
    firma_letras= models.BooleanField(default=False)

    class Meta:
        verbose_name = "Informacion de arriendos en curso"
        verbose_name_plural = "Informacion de arriendos en curso"


class SolicitudPublicacion(models.Model):
    """Propiedad que una persona (sin cuenta) quiere publicar con nosotros, enviada desde el portal.

    No es todavia un inmueble publicado: el equipo la revisa en el admin, contacta a la persona y, si procede, registra
    el inmueble a nombre de un propietario.
    """
    ESTADOS = [('pendiente', 'Pendiente'), ('contactado', 'Contactado'), ('descartada', 'Descartada')]

    nombre = models.CharField(max_length=120)
    telefono = models.CharField(max_length=30)
    correo = models.EmailField(blank=True)
    tipoInmueble = models.CharField(blank=True, max_length=100)  # Casa, Apartamento, Habitacion, Local...
    modalidad = models.CharField(max_length=10, choices=[('arriendo', 'En arriendo'), ('venta', 'En venta')], default='arriendo')
    direccion = models.CharField(max_length=100)
    barrio = models.CharField(blank=True, max_length=100)
    ciudad = models.CharField(blank=True, max_length=50)
    precio = models.IntegerField(blank=True, null=True, help_text='Canon mensual o precio de venta, segun la modalidad')
    descripcion = models.TextField(blank=True)
    foto = models.ImageField(upload_to='media/publicaciones/', blank=True, null=True)
    acepta_datos = models.BooleanField(default=False, help_text='Autorizó el uso de sus datos para contactarlo')
    estado = models.CharField(max_length=12, choices=ESTADOS, default='pendiente')
    notas = models.TextField(blank=True, help_text='Notas internas del equipo')
    creada = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Solicitud para publicar una propiedad"
        verbose_name_plural = "Solicitudes para publicar una propiedad"
        ordering = ['-creada']

    def save(self, *args, **kwargs):
        comprimir_imagen(self.foto)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre} - {self.direccion}"


class ConsultaInmueble(models.Model):
    """Mensaje o solicitud de visita que una persona (sin cuenta) deja desde la ficha publica de un inmueble."""
    TIPOS = [('info', 'Quiere más información'), ('visita', 'Quiere agendar una visita')]
    ESTADOS = [('nueva', 'Nueva'), ('atendida', 'Atendida'), ('descartada', 'Descartada')]
    FRANJAS = [('manana', 'Mañana'), ('tarde', 'Tarde')]

    casa = models.ForeignKey(arrendar, on_delete=models.CASCADE, related_name='consultas')
    tipo = models.CharField(max_length=10, choices=TIPOS, default='info')
    nombre = models.CharField(max_length=120)
    telefono = models.CharField(max_length=30)
    correo = models.EmailField(blank=True)
    mensaje = models.TextField(blank=True)
    fecha_visita = models.DateField(null=True, blank=True)
    franja_visita = models.CharField(max_length=6, choices=FRANJAS, blank=True)
    acepta_datos = models.BooleanField(default=False, help_text='Autorizó el uso de sus datos para contactarlo')
    estado = models.CharField(max_length=10, choices=ESTADOS, default='nueva')
    notas = models.TextField(blank=True, help_text='Notas internas del equipo')
    creada = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Consulta sobre un inmueble"
        verbose_name_plural = "Consultas sobre inmuebles"
        ordering = ['-creada']

    def __str__(self):
        return f"{self.nombre} - {self.casa_id}"
