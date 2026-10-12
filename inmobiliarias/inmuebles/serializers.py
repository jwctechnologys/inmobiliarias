"""Serializadores de casas, fotos y videos."""
from rest_framework import serializers
from inmobiliarias.vacios import VaciosANoneMixin

from inmuebles.models import Imagen_casa_arrendar, SolicitudPublicacion, Video_Casa, arrendar


class InmuebleSerializer(serializers.ModelSerializer):
    class Meta:
        model = arrendar
        fields = '__all__'
        depth = 3


class CasaSerializer(VaciosANoneMixin, serializers.ModelSerializer):
    solicitudes_count = serializers.IntegerField(source="solicitudes.count", read_only=True)
    class Meta:
        model = arrendar
        fields = '__all__'


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
                  'precio', 'descripcion', 'foto']

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
