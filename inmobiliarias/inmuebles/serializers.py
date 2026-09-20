"""Serializadores de casas, fotos y videos."""
from rest_framework import serializers

from inmuebles.models import Imagen_casa_arrendar, Video_Casa, arrendar


class InmuebleSerializer(serializers.ModelSerializer):
    class Meta:
        model = arrendar
        fields = '__all__'
        depth = 3


class CasaSerializer(serializers.ModelSerializer):
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
