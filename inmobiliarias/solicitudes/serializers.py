"""Serializadores de solicitudes de arriendo."""
from rest_framework import serializers

from solicitudes.models import Solicitud


class SolicitudSerializer(serializers.ModelSerializer):
    nombres_arrendatario = serializers.CharField(source='usuario.user.first_name', read_only=True)
    apellidos_arrendatario = serializers.CharField(source='usuario.user.last_name', read_only=True)
    celular_arrendatario = serializers.CharField(source='usuario.celular', read_only=True)
    tipo = serializers.CharField(source='casa.tipoInmueble', read_only=True)
    direccion = serializers.SerializerMethodField()
    
    # URLs para descargar documentos
    cedula_arrendatario_url = serializers.SerializerMethodField()
    cedula_codeudor_url = serializers.SerializerMethodField()
    cedulas_habitantes_url = serializers.SerializerMethodField()
    certificado_laboral_arrendatario_url = serializers.SerializerMethodField()
    certificado_laboral_codeudor_url = serializers.SerializerMethodField()
    desprendible_nomina_arrendatario_url = serializers.SerializerMethodField()
    desprendible_nomina_codeudor_url = serializers.SerializerMethodField()
    declaracion_renta_arrendatario_url = serializers.SerializerMethodField()
    declaracion_renta_codeudor_url = serializers.SerializerMethodField()
    camara_comercio_arrendatario_url = serializers.SerializerMethodField()
    camara_comercio_codeudor_url = serializers.SerializerMethodField()

    class Meta:
        model = Solicitud
        fields = [
            'id', 
            'tipo', 
            'direccion', 
            'nombres_arrendatario', 
            'apellidos_arrendatario',
            'celular_arrendatario',
            'fecha', 
            'estado',
            'solicitudAtendida',
            'solicitudContratada',
            'comentario_estado',
            'duracionContrato',
            'seguroArrendamiento',
            'depositoVoluntario',
            'valorDepositoVoluntario',
            'otraGarantiaAcrodada',
            'especificacionOtraGarantiaAcordada',
            'mascotas',
            'numMascotas',
            'tipoMascotas',
            # URLs de documentos
            'cedula_arrendatario_url',
            'cedula_codeudor_url',
            'cedulas_habitantes_url',
            'certificado_laboral_arrendatario_url',
            'certificado_laboral_codeudor_url',
            'desprendible_nomina_arrendatario_url',
            'desprendible_nomina_codeudor_url',
            'declaracion_renta_arrendatario_url',
            'declaracion_renta_codeudor_url',
            'camara_comercio_arrendatario_url',
            'camara_comercio_codeudor_url',
        ]

    def get_direccion(self, obj):
        direccion = obj.casa.direccion
        barrio = obj.casa.barrio
        ciudad = obj.casa.ciudad
        return f"{direccion}, {barrio}, {ciudad}" if barrio and ciudad else direccion

    def get_cedula_arrendatario_url(self, obj):
        if obj.cedulaArrendatario:
            return obj.cedulaArrendatario.url
        return None

    def get_cedula_codeudor_url(self, obj):
        if obj.cedulaCodeudor:
            return obj.cedulaCodeudor.url
        return None

    def get_cedulas_habitantes_url(self, obj):
        if obj.cedulasHabitantes:
            return obj.cedulasHabitantes.url
        return None

    def get_certificado_laboral_arrendatario_url(self, obj):
        if obj.certificado_laboral_arrendatario:
            return obj.certificado_laboral_arrendatario.url
        return None

    def get_certificado_laboral_codeudor_url(self, obj):
        if obj.certificado_laboral_codeudor:
            return obj.certificado_laboral_codeudor.url
        return None

    def get_desprendible_nomina_arrendatario_url(self, obj):
        if obj.desprendible_nomina_arrendatario:
            return obj.desprendible_nomina_arrendatario.url
        return None

    def get_desprendible_nomina_codeudor_url(self, obj):
        if obj.desprendible_nomina_codeudor:
            return obj.desprendible_nomina_codeudor.url
        return None

    def get_declaracion_renta_arrendatario_url(self, obj):
        if obj.declaracion_renta_arrendatario:
            return obj.declaracion_renta_arrendatario.url
        return None

    def get_declaracion_renta_codeudor_url(self, obj):
        if obj.declaracion_renta_codeudor:
            return obj.declaracion_renta_codeudor.url
        return None

    def get_camara_comercio_arrendatario_url(self, obj):
        if obj.camara_comercio_arrendatario:
            return obj.camara_comercio_arrendatario.url
        return None

    def get_camara_comercio_codeudor_url(self, obj):
        if obj.camara_comercio_codeudor:
            return obj.camara_comercio_codeudor.url
        return None


class SolicitudCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solicitud
        fields = [
            'casa',
            'usuario',
            'duracionContrato',
            'seguroArrendamiento',
            'depositoVoluntario',
            'valorDepositoVoluntario',
            'otraGarantiaAcrodada',
            'especificacionOtraGarantiaAcordada',
            'mascotas',
            'numMascotas',
            'tipoMascotas',
            'aceptaTratamientodeDatos'
            # Documentos
            'cedulaArrendatario',
            'cedulaCodeudor',
            'cedulasHabitantes',
            'certificado_laboral_arrendatario',
            'certificado_laboral_codeudor',
            'desprendible_nomina_arrendatario',
            'desprendible_nomina_codeudor',
            'declaracion_renta_arrendatario',
            'declaracion_renta_codeudor',
            'camara_comercio_arrendatario',
            'camara_comercio_codeudor',
        ]

    def create(self, validated_data):
        return Solicitud.objects.create(**validated_data)
