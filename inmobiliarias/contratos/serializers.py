"""Serializadores de contratos, otrosi, pagos, novedades e inconformidades."""
from datetime import datetime

from rest_framework import serializers

from contratos.models import (
    FechaPago,
    ReporteInconformidad,
    ReportePagoRecibos,
    contrato_local_vivienda,
    imagenReporteNovedades,
    otroSi,
    reporteNovedades,
    videoReporteNovedades,
)


class ContratoViviendaSerializer(serializers.ModelSerializer):
    """
    Serializer principal para el contrato de vivienda
    """
    # Campos de solo lectura para mostrar información adicional
    estado_del_contrato = serializers.SerializerMethodField()
    meses_contrato = serializers.SerializerMethodField()
    
    class Meta:
        model = contrato_local_vivienda
        fields = [
            # ID y auditoría
            'id',
            'creado_en',
            'actualizado_en',
            
            # DATOS DEL ARRENDADOR
            'arrendador_nombre_completo',
            'arrendador_tipo_documento',
            'arrendador_doc_identificacion',
            'arrendador_lugar_exp_cedula',
            'arrendador_celular',
            'arrendador_celular_dos',
            'arrendador_email',
            'arrendador_direccion',
            'arrendador_barrio',
            'arrendador_ciudad',
            'arrendador_direccion_correspondencia',
            'arrendador_barrio_correspondencia',
            'arrendador_ciudad_correspondencia',
            'arrendador_genero',
            'arrendador_cuenta_bancolombia',
            'arrendador_cuenta_nequi',
            'arrendador_cuenta_daviplata',
            'arrendador_llave',
            'arrendador_empresa',
            'arrendador_ocupacion',
            'arrendador_estado_civil',
            'arrendador_tipo_usuario',
            
            # DATOS DEL ARRENDATARIO
            'arrendatario_nombre_completo',
            'arrendatario_tipo_documento',
            'arrendatario_doc_identificacion',
            'arrendatario_lugar_exp_cedula',
            'arrendatario_celular',
            'arrendatario_email',
            'arrendatario_direccion',
            'arrendatario_barrio',
            'arrendatario_ciudad',
            'arrendatario_genero',
            'arrendatario_ocupacion',
            'arrendatario_empresa',
            
            # DATOS DEL COARRENDATARIO
            'coarrendatario_nombre_completo',
            'coarrendatario_tipo_documento',
            'coarrendatario_doc_identificacion',
            'coarrendatario_lugar_exp_cedula',
            'coarrendatario_celular',
            'coarrendatario_email',
            'coarrendatario_direccion',
            'coarrendatario_barrio',
            'coarrendatario_ciudad',
            'coarrendatario_genero',
            'coarrendatario_ocupacion',
            'coarrendatario_empresa',
            'tiene_coarrendatario',
            
            # DATOS DEL INMUEBLE
            'inmueble_direccion',
            'inmueble_barrio',
            'inmueble_ciudad',
            'inmueble_descripcion',
            'inmueble_tipo',
            'inmueble_matricula',
            'inmueble_canon_mensual',
            'inmueble_ser_agua',
            'inmueble_observacion_agua',
            'inmueble_ser_gas',
            'inmueble_observacion_gas',
            'inmueble_ser_aseo',
            'inmueble_observacion_aseo',
            'inmueble_ser_energia',
            'inmueble_observacion_energia',
            
            # DEPENDIENTES Y CLAUSULAS
            'dependientes_copia',
            'clausulas_copia',
            
            # CONDICIONES DEL CONTRATO
            'fechainicio',
            'fechafin',
            'diaHInicioPago',
            'diaFinPago',
            'contrato_Activo',
            'ciudad',
            'tipoContrato',
            'fechaEntregaInmueble',
            'fechaRestitucionInmueble',
            'fecha',
            'canonArrendamiento',
            'penalidadDiaria',
            'clausulaPenalPorcentaje',
            'duracionMeses',
            
            # REFERENCIAS ORIGINALES (auditoría)
            'arrendador_id_original',
            'arrendatario_id_original',
            'coarrendatario_id_original',
            'inmueble_id_original',
            'solicitud_id',
            
            # DOCUMENTOS Y ESTADOS
            'estaFirmado',
            'estaFirmadoArrendatario',
            'pdf_firmado',
            'pdf_inventario',
            'numOtrosi',
            'otrosiGenerado',
            'fechafinOtrosi',
            
            # CAMPOS CALCULADOS
            'estado_del_contrato',
            'meses_contrato',
        ]
        read_only_fields = [
            'id', 'creado_en', 'actualizado_en', 
            'estado_del_contrato', 'meses_contrato'
        ]

    def get_estado_del_contrato(self, obj):
        """Determina el estado actual del contrato"""
        hoy = datetime.now().date()
        if not obj.contrato_Activo:
            return "Inactivo"
        if obj.fechafin < hoy:
            return "Vencido"
        if obj.fechainicio > hoy:
            return "Próximo a iniciar"
        return "Activo"

    def get_meses_contrato(self, obj):
        """Devuelve los meses del contrato"""
        return obj.calcular_meses()


class ContratoViviendaCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para CREAR un contrato - Recibe todos los datos del frontend
    """
    class Meta:
        model = contrato_local_vivienda
        fields = '__all__'
        read_only_fields = [
            'id', 'creado_en', 'actualizado_en',
            'estaFirmado', 'estaFirmadoArrendatario',
            'numOtrosi', 'otrosiGenerado'
        ]

    def validate(self, data):
        """
        Validaciones personalizadas
        """
        # Validar que las fechas sean consistentes
        if data.get('fechainicio') and data.get('fechafin'):
            if data['fechainicio'] >= data['fechafin']:
                raise serializers.ValidationError({
                    'fechafin': 'La fecha de fin debe ser posterior a la fecha de inicio'
                })

        # Validar que el canon sea positivo
        if data.get('canonArrendamiento', 0) <= 0:
            raise serializers.ValidationError({
                'canonArrendamiento': 'El canon de arrendamiento debe ser mayor a cero'
            })

        return data


class ContratoViviendaUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para ACTUALIZAR un contrato
    Solo permite actualizar ciertos campos (estados, documentos, fechas de otrosí)
    """
    class Meta:
        model = contrato_local_vivienda
        fields = [
            # Solo campos que pueden actualizarse
            'contrato_Activo',
            'estaFirmado',
            'estaFirmadoArrendatario',
            'pdf_firmado',
            'pdf_inventario',
            'numOtrosi',
            'otrosiGenerado',
            'fechafinOtrosi',
            'fechafin',  # Podría actualizarse en caso de prórroga
            'duracionMeses',  # Podría actualizarse
        ]
        read_only_fields = [
            'id', 'creado_en', 'actualizado_en',
            # Los datos copiados no se pueden actualizar (son inmutables)
            'arrendador_nombre_completo',
            'arrendador_doc_identificacion',
            # ... todos los campos de copia
        ]

    def validate(self, data):
        """
        Validación específica para actualizaciones
        """
        # Si se actualiza la fecha de fin de otrosí
        if 'fechafinOtrosi' in data and data['fechafinOtrosi']:
            if data['fechafinOtrosi'] <= self.instance.fechainicio:
                raise serializers.ValidationError({
                    'fechafinOtrosi': 'La fecha de fin de otrosí debe ser posterior a la fecha de inicio'
                })
        return data


class ContratoViviendaListSerializer(serializers.ModelSerializer):
    """
    Serializer para listar contratos (versión resumida)
    """
    estado = serializers.SerializerMethodField()
    arrendatario = serializers.CharField(source='arrendatario_nombre_completo')
    inmueble = serializers.CharField(source='inmueble_direccion')
    
    class Meta:
        model = contrato_local_vivienda
        fields = [
            'id',
            'arrendatario',
            'inmueble',
            'fechainicio',
            'fechafin',
            'canonArrendamiento',
            'contrato_Activo',
            'estado',
            'creado_en',
        ]

    def get_estado(self, obj):
        hoy = datetime.now().date()
        if not obj.contrato_Activo:
            return "Inactivo"
        if obj.fechafin < hoy:
            return "Vencido"
        if obj.fechainicio > hoy:
            return "Próximo a iniciar"
        return "Activo"


class ContratoViviendaDetalleSerializer(ContratoViviendaSerializer):
    """
    Serializer para detalles del contrato - incluye información extendida
    """
    dependientes = serializers.SerializerMethodField()
    tiene_dependientes = serializers.SerializerMethodField()
    fecha_inicio_formateada = serializers.SerializerMethodField()
    fecha_fin_formateada = serializers.SerializerMethodField()
    canon_letras = serializers.SerializerMethodField()
    
    class Meta(ContratoViviendaSerializer.Meta):
        fields = ContratoViviendaSerializer.Meta.fields + [
            'dependientes',
            'tiene_dependientes',
            'fecha_inicio_formateada',
            'fecha_fin_formateada',
            'canon_letras',
        ]

    def get_dependientes(self, obj):
        """Devuelve los dependientes formateados"""
        if not obj.dependientes_copia:
            return []
        return obj.dependientes_copia

    def get_tiene_dependientes(self, obj):
        """Indica si el contrato tiene dependientes"""
        return bool(obj.dependientes_copia)

    def get_fecha_inicio_formateada(self, obj):
        """Fecha de inicio formateada"""
        if obj.fechainicio:
            return obj.fechainicio.strftime('%d de %B de %Y')
        return None

    def get_fecha_fin_formateada(self, obj):
        """Fecha de fin formateada"""
        if obj.fechafin:
            return obj.fechafin.strftime('%d de %B de %Y')
        return None

    def get_canon_letras(self, obj):
        """Canon de arrendamiento en letras"""
        # Aquí puedes implementar la conversión a letras
        # Si tienes una función utilitaria para esto
        return None


class ImagenReporteNovedadesSerializer(serializers.ModelSerializer):
    class Meta:
        model = imagenReporteNovedades
        fields = ['id', 'imagen']


class VideoReporteNovedadesSerializer(serializers.ModelSerializer):
    class Meta:
        model = videoReporteNovedades
        fields = ['id', 'video_archivo']


class ReporteNovedadesSerializer(serializers.ModelSerializer):
    imagenes = ImagenReporteNovedadesSerializer(many=True, read_only=True)
    videos = VideoReporteNovedadesSerializer(many=True, read_only=True)
    contrato_detalle = serializers.SerializerMethodField()

    class Meta:
        model = reporteNovedades
        fields = '__all__'

    def get_contrato_detalle(self, obj):
        """Devuelve detalles del contrato"""
        if obj.contratoNum:
            return {
                "id": obj.contratoNum.id,
                "arrendatario": obj.contratoNum.arrendatario_nombre_completo,
                "inmueble": obj.contratoNum.inmueble_direccion,
            }
        return None
    depth = 2


class ReportePagoRecibosSerializer(serializers.ModelSerializer):
    imagenReciboLuz = serializers.ImageField(required=False)
    imagenReciboAgua = serializers.ImageField(required=False)
    imagenReciboGas = serializers.ImageField(required=False)
    imagenReciboBioagricola = serializers.ImageField(required=False)
    
    class Meta:
        model = ReportePagoRecibos
        fields = [
            "reportePagoReciboContrato",
            "imagenReciboLuz",
            "imagenReciboAgua",
            "imagenReciboGas",
            "imagenReciboBioagricola",
        ]

    def validate(self, attrs):
        if not any([
            attrs.get("imagenReciboLuz"),
            attrs.get("imagenReciboAgua"),
            attrs.get("imagenReciboGas"),
            attrs.get("imagenReciboBioagricola"),
        ]):
            raise serializers.ValidationError(
                "Debe subir al menos un recibo."
            )
        return attrs


class FechaPagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FechaPago
        fields = '__all__'


class ContratoGeneralSerializer(serializers.ModelSerializer):
    """
    Serializer para compatibilidad con vistas existentes
    Emula los campos que antes venían de relaciones
    """
    nombres_arrendatario = serializers.CharField(source='arrendatario_nombre_completo', read_only=True)
    apellidos_arrendatario = serializers.CharField(read_only=True)  # Ya viene en el nombre completo
    nombres_arrendador = serializers.CharField(source='arrendador_nombre_completo', read_only=True)
    apellidos_arrendador = serializers.CharField(read_only=True)
    canonmensual = serializers.DecimalField(source='canonArrendamiento', read_only=True, max_digits=15, decimal_places=2)
    genero_arrendatario = serializers.CharField(source='arrendatario_genero', read_only=True)
    genero_arrendador = serializers.CharField(source='arrendador_genero', read_only=True)
    fechas_pago = FechaPagoSerializer(many=True, read_only=True)
    
    class Meta:
        model = contrato_local_vivienda
        fields = '__all__'


class ContratoInconformeSerializer(serializers.ModelSerializer):
    inconformidad_id = serializers.SerializerMethodField()
    inconformidad = serializers.SerializerMethodField()
    arrendatario = serializers.CharField(source='arrendatario_nombre_completo')
    inmueble = serializers.CharField(source='inmueble_direccion')

    class Meta:
        model = contrato_local_vivienda
        fields = [
            'id', 
            'tipoContrato', 
            'arrendatario',
            'inmueble',
            'inconformidad_id', 
            'inconformidad'
        ]

    def get_inconformidad_id(self, obj):
        try:
            reporte = ReporteInconformidad.objects.get(reporteinconformidad=obj)
            return reporte.id
        except ReporteInconformidad.DoesNotExist:
            return None

    def get_inconformidad(self, obj):
        try:
            reporte = ReporteInconformidad.objects.get(reporteinconformidad=obj)
            return reporte.Inconformidad
        except ReporteInconformidad.DoesNotExist:
            return None


class OtroSiSerializer(serializers.ModelSerializer):
    class Meta:
        model = otroSi
        fields = '__all__'


class ReporteInconformidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReporteInconformidad
        fields = '__all__'


class ContratoDetalleSerializer(serializers.ModelSerializer):
    nombres_arrendatario = serializers.CharField(source='arrendatario_nombre_completo', read_only=True)
    apellidos_arrendatario = serializers.CharField(read_only=True)
    arrendatarioId = serializers.IntegerField(source='arrendatario_id_original', read_only=True)
    fechas_pago_realizadas = serializers.SerializerMethodField()

    class Meta:
        model = contrato_local_vivienda
        fields = [
            'id',
            'arrendatarioId',
            'nombres_arrendatario',
            'apellidos_arrendatario',
            'numOtrosi',
            'fechas_pago_realizadas'
        ]

    def get_fechas_pago_realizadas(self, obj):
        fechas_realizadas = obj.fechas_pago.filter(estado_pago='REALIZADO')
        return FechaPagoSerializer(fechas_realizadas, many=True).data
