"""Serializadores de usuarios y perfiles de rol."""
from rest_framework import serializers

from usuarios.models import administrador, arrendatario, propietario


class administradorSerializer(serializers.ModelSerializer):
    class Meta:
        model = administrador
        fields = '__all__'
        depth = 2
        extra_kwargs = {
            'password': {'write_only': True}
        }


class ArrendatarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = arrendatario
        fields = '__all__'
        depth = 2
        extra_kwargs = {
            'password': {'write_only': True}
        }


class PropietarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = propietario
        fields = '__all__'
        depth = 2
        extra_kwargs = {
            'password': {'write_only': True}
        }
