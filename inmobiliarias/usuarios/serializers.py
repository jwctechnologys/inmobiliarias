"""Serializadores de usuarios y perfiles de rol."""
from rest_framework import serializers
from inmobiliarias.vacios import VaciosANoneMixin

from usuarios.models import administrador, arrendatario, propietario


class administradorSerializer(VaciosANoneMixin, serializers.ModelSerializer):
    class Meta:
        model = administrador
        fields = '__all__'
        depth = 2
        extra_kwargs = {
            'password': {'write_only': True}
        }


class ArrendatarioSerializer(VaciosANoneMixin, serializers.ModelSerializer):
    class Meta:
        model = arrendatario
        fields = '__all__'
        depth = 2
        extra_kwargs = {
            'password': {'write_only': True}
        }


class PropietarioSerializer(VaciosANoneMixin, serializers.ModelSerializer):
    class Meta:
        model = propietario
        fields = '__all__'
        depth = 2
        extra_kwargs = {
            'password': {'write_only': True}
        }
