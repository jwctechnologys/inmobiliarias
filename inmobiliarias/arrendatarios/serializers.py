"""Serializadores de la ficha del arrendatario."""
from rest_framework import serializers
from inmobiliarias.vacios import VaciosANoneMixin

from arrendatarios.models import coarrendatario, dependientes, referencias


class coarrendatarioSerializer(VaciosANoneMixin, serializers.ModelSerializer):
    class Meta:
        model = coarrendatario
        fields = '__all__'
        depth = 2


class referenciasSerializer(VaciosANoneMixin, serializers.ModelSerializer):
    class Meta:
        model = referencias
        fields = '__all__'


class dependientesSerializer(VaciosANoneMixin, serializers.ModelSerializer):
    class Meta:
        model = dependientes
        fields = '__all__'
