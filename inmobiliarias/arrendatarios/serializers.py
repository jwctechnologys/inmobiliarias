"""Serializadores de la ficha del arrendatario."""
from rest_framework import serializers

from arrendatarios.models import coarrendatario, dependientes, referencias


class coarrendatarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = coarrendatario
        fields = '__all__'
        depth = 2


class referenciasSerializer(serializers.ModelSerializer):
    class Meta:
        model = referencias
        fields = '__all__'


class dependientesSerializer(serializers.ModelSerializer):
    class Meta:
        model = dependientes
        fields = '__all__'
