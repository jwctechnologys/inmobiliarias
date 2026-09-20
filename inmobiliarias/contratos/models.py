from django.db import models
from datetime import date
# Create your models here.



class contrato_local_vivienda(models.Model):
    # =========================================================
    # INFORMACIÓN DEL ARRENDADOR (COPIA INMUTABLE)
    # =========================================================
    arrendador_nombre_completo = models.CharField(max_length=200)
    arrendador_tipo_documento = models.CharField(max_length=20, default='CC')
    arrendador_doc_identificacion = models.CharField(max_length=30)
    arrendador_lugar_exp_cedula = models.CharField(max_length=100, default='Villavicencio')
    arrendador_celular = models.CharField(max_length=20, blank=True)
    arrendador_celular_dos = models.CharField(max_length=20, blank=True)
    arrendador_email = models.EmailField(blank=True)
    arrendador_direccion = models.TextField(blank=True)
    arrendador_barrio = models.CharField(max_length=100, blank=True)
    arrendador_ciudad = models.CharField(max_length=100, default='Villavicencio')
    arrendador_direccion_correspondencia = models.TextField(blank=True)
    arrendador_barrio_correspondencia = models.CharField(max_length=100, blank=True)
    arrendador_ciudad_correspondencia = models.CharField(max_length=100, default='Villavicencio')
    arrendador_genero = models.CharField(max_length=1, choices=[('M', 'Masculino'), ('F', 'Femenino')], default='M')
    arrendador_cuenta_bancolombia = models.CharField(max_length=50, blank=True)
    arrendador_cuenta_nequi = models.CharField(max_length=50, blank=True)
    arrendador_cuenta_daviplata = models.CharField(max_length=50, blank=True)
    arrendador_llave = models.CharField(max_length=100, blank=True)
    arrendador_empresa = models.CharField(max_length=200, blank=True)
    arrendador_ocupacion = models.CharField(max_length=200, blank=True)
    arrendador_estado_civil = models.CharField(max_length=50, blank=True)
    arrendador_tipo_usuario = models.CharField(max_length=30, default='propietario')  # propietario o administrador

    # =========================================================
    # INFORMACIÓN DEL ARRENDATARIO (COPIA INMUTABLE)
    # =========================================================
    arrendatario_nombre_completo = models.CharField(max_length=200)
    arrendatario_tipo_documento = models.CharField(max_length=20, default='CC')
    arrendatario_doc_identificacion = models.CharField(max_length=30)
    arrendatario_lugar_exp_cedula = models.CharField(max_length=100, default='Villavicencio')
    arrendatario_celular = models.CharField(max_length=20, blank=True)
    arrendatario_email = models.EmailField(blank=True)
    arrendatario_direccion = models.TextField(blank=True)
    arrendatario_barrio = models.CharField(max_length=100, blank=True)
    arrendatario_ciudad = models.CharField(max_length=100, default='Villavicencio')
    arrendatario_genero = models.CharField(max_length=1, choices=[('M', 'Masculino'), ('F', 'Femenino')], default='M')
    arrendatario_ocupacion = models.CharField(max_length=200, blank=True)
    arrendatario_empresa = models.CharField(max_length=200, blank=True)

    # =========================================================
    # INFORMACIÓN DEL COARRENDATARIO (COPIA INMUTABLE)
    # =========================================================
    coarrendatario_nombre_completo = models.CharField(max_length=200, blank=True)
    coarrendatario_tipo_documento = models.CharField(max_length=20, default='CC', blank=True)
    coarrendatario_doc_identificacion = models.CharField(max_length=30, blank=True)
    coarrendatario_lugar_exp_cedula = models.CharField(max_length=100, default='Villavicencio', blank=True)
    coarrendatario_celular = models.CharField(max_length=20, blank=True)
    coarrendatario_email = models.EmailField(blank=True)
    coarrendatario_direccion = models.TextField(blank=True)
    coarrendatario_barrio = models.CharField(max_length=100, blank=True)
    coarrendatario_ciudad = models.CharField(max_length=100, default='Villavicencio', blank=True)
    coarrendatario_genero = models.CharField(max_length=1, choices=[('M', 'Masculino'), ('F', 'Femenino')], default='M', blank=True)
    coarrendatario_ocupacion = models.CharField(max_length=200, blank=True)
    coarrendatario_empresa = models.CharField(max_length=200, blank=True)
    tiene_coarrendatario = models.BooleanField(default=False)

    # =========================================================
    # INFORMACIÓN DEL INMUEBLE (COPIA INMUTABLE)
    # =========================================================
    inmueble_direccion = models.TextField()
    inmueble_barrio = models.CharField(max_length=100)
    inmueble_ciudad = models.CharField(max_length=100, default='Villavicencio')
    inmueble_descripcion = models.TextField(blank=True)
    inmueble_tipo = models.CharField(max_length=50, blank=True)
    inmueble_matricula = models.CharField(max_length=50)
    inmueble_canon_mensual = models.DecimalField(max_digits=15, decimal_places=2)

    # Servicios del inmueble
    inmueble_ser_agua = models.BooleanField(default=False)
    inmueble_observacion_agua = models.TextField(blank=True)
    inmueble_ser_gas = models.BooleanField(default=False)
    inmueble_observacion_gas = models.TextField(blank=True)
    inmueble_ser_aseo = models.BooleanField(default=False)
    inmueble_observacion_aseo = models.TextField(blank=True)
    inmueble_ser_energia = models.BooleanField(default=False)
    inmueble_observacion_energia = models.TextField(blank=True)

    # =========================================================
    # DEPENDIENTES (COPIA EN JSON)
    # =========================================================
    dependientes_copia = models.JSONField(default=list, blank=True)

    # =========================================================
    # CONDICIONES DEL CONTRATO
    # =========================================================
    fechainicio = models.DateField()
    fechafin = models.DateField()
    diaHInicioPago = models.IntegerField(default=3)
    diaFinPago = models.IntegerField(default=8)
    contrato_Activo = models.BooleanField(default=True)
    ciudad = models.CharField(max_length=30, default='Villavicencio')
    tipoContrato = models.CharField(max_length=30, default='vivienda')
    fechaEntregaInmueble = models.DateField()
    fechaRestitucionInmueble = models.DateField()
    fecha = models.DateField()
    canonArrendamiento = models.DecimalField(max_digits=15, decimal_places=2)
    penalidadDiaria = models.DecimalField(max_digits=15, decimal_places=2, default=9000)
    clausulaPenalPorcentaje = models.IntegerField(default=20)
    duracionMeses = models.IntegerField(default=6)

    # =========================================================
    # CLAUSULAS (COPIA EN JSON)
    # =========================================================
    clausulas_copia = models.JSONField(default=list)

    # =========================================================
    # REFERENCIAS A OTROS MODELOS (SOLO PARA AUDITORÍA)
    # =========================================================
    arrendador_id_original = models.IntegerField(null=True, blank=True, help_text="ID del usuario en el sistema")
    arrendatario_id_original = models.IntegerField(null=True, blank=True, help_text="ID del arrendatario en el sistema")
    coarrendatario_id_original = models.IntegerField(null=True, blank=True, help_text="ID del coarrendatario en el sistema")
    inmueble_id_original = models.IntegerField(null=True, blank=True, help_text="ID del inmueble en el sistema")
    solicitud_id = models.IntegerField(null=True, blank=True, help_text="ID de la solicitud que generó el contrato")

    # =========================================================
    # DOCUMENTOS Y ESTADOS
    # =========================================================
    estaFirmado = models.BooleanField(default=False)
    estaFirmadoArrendatario = models.BooleanField(default=False)
    pdf_firmado = models.FileField(upload_to='contratos_firmados/', null=True, blank=True)
    pdf_inventario = models.FileField(upload_to='contratos/inventarios/', null=True, blank=True)
    numOtrosi = models.IntegerField(default=0)
    otrosiGenerado = models.BooleanField(default=False)
    fechafinOtrosi = models.DateField(null=True, blank=True)

    # Auditoría
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Contrato de Vivienda"
        verbose_name_plural = "Contratos de Vivienda"
        ordering = ['-creado_en']

    def __str__(self):
        return f"Contrato {self.id} - {self.arrendatario_nombre_completo} - {self.inmueble_direccion}"

    def calcular_meses(self):
        """Calcula los meses del contrato para Otrosí"""
        meses = []
        if not self.fechafinOtrosi:
            return meses
        
        fecha_actual = self.fechainicio
        while fecha_actual < self.fechafinOtrosi:
            meses.append(fecha_actual)
            if fecha_actual.month == 12:
                fecha_actual = date(fecha_actual.year + 1, 1, self.diaFinPago or fecha_actual.day)
            else:
                fecha_actual = date(fecha_actual.year, fecha_actual.month + 1, self.diaFinPago or fecha_actual.day)
        return meses

    def get_resumen_contrato(self):
        """Devuelve un resumen del contrato para mostrar"""
        return {
            'id': self.id,
            'arrendador': self.arrendador_nombre_completo,
            'arrendatario': self.arrendatario_nombre_completo,
            'inmueble': self.inmueble_direccion,
            'canon': self.canonArrendamiento,
            'fecha_inicio': self.fechainicio,
            'fecha_fin': self.fechafin,
            'estado': 'Activo' if self.contrato_Activo else 'Inactivo',
            'firmado': self.estaFirmado and self.estaFirmadoArrendatario
        }

class otroSi(models.Model):
    contrato= models.ForeignKey(contrato_local_vivienda, on_delete=models.CASCADE, related_name="otroSI")
    canonmensualOtrosi = models.IntegerField(null=True, blank=True)
    fechainicio = models.DateField(default="2024-01-01",blank=True)
    fechafin = models.DateField(default="2024-01-01",blank=True)
    aceptaOtroSi=models.BooleanField(default=False) #arrendador
    aceptaOtroSiArrendatario=models.BooleanField(default=False) #arrendador
    vistaImpresion=models.BooleanField(default=False) 
    numOtrosi=models.IntegerField(default=0)
    pdf_firmado = models.FileField(upload_to='otrosi_firmados/', null=True, blank=True)

class FechaPago(models.Model):
    contrato = models.ForeignKey(contrato_local_vivienda, on_delete=models.CASCADE, related_name="fechas_pago")
    fecha_pago = models.DateField()
    fechadeMesaPagar= models.DateField(null=True, blank=True)
    estado_pago = models.CharField(max_length=50, choices=[('PENDIENTE', 'Pendiente'), ('REALIZADO', 'Realizado')], default='PENDIENTE')

    def __str__(self):
        return f"Fecha de pago: {self.fecha_pago} - Estado: {self.estado_pago}"
    
class Clausula(models.Model):
    texto = models.TextField()
    contrato = models.ForeignKey('contrato_local_vivienda', on_delete=models.CASCADE, related_name='clausulas')
    def __str__(self):
        return self.texto[:50]
    
class fechadePago(models.Model):
    contratoNum = models.ForeignKey (contrato_local_vivienda ,on_delete=models.CASCADE)
    fechadePago=models.IntegerField(blank=True, null=True)
    diasAtrasado=models.IntegerField(blank=True, null=True)
    diasAdelantado=models.IntegerField(blank=True, null=True)

class reporteNovedades(models.Model):
    contratoNum = models.ForeignKey (contrato_local_vivienda ,on_delete=models.CASCADE)
    fechaReporte = models.DateTimeField(auto_now_add=True,blank=True, null=True)
    texto = models.TextField()
    textoAdministrador= models.TextField(blank=True, null=True)
    estaHabilitado=models.BooleanField(default=False)
    estaResuelto=models.BooleanField(default=False)
    estaResueltoArrendatario=models.BooleanField(default=False)

class imagenReporteNovedades(models.Model):
    reporteNovedad = models.ForeignKey(reporteNovedades, on_delete=models.CASCADE, related_name="imagenes")
    imagen = models.ImageField(upload_to="media/")

class videoReporteNovedades(models.Model):
    reporteNovedad = models.ForeignKey(reporteNovedades, on_delete=models.CASCADE, related_name="videos")
    video_archivo = models.FileField(upload_to="media/")


class ReportePagoRecibos(models.Model):
    reportePagoReciboContrato = models.ForeignKey(
        contrato_local_vivienda, on_delete=models.CASCADE, related_name="pagos_recibos"
    )
    imagenReciboLuz = models.ImageField(upload_to="recibos/")
    imagenReciboAgua = models.ImageField(upload_to="recibos/")
    imagenReciboGas = models.ImageField(upload_to="recibos/")
    imagenReciboBioagricola = models.ImageField(upload_to="recibos/")

class ReporteInconformidad(models.Model):
    reporteinconformidad = models.ForeignKey(contrato_local_vivienda, on_delete=models.CASCADE)
    estaInconforme=models.BooleanField(default=False)
    inconformidadSolucionada=models.BooleanField(default=False)
    Inconformidad = models.TextField()

class ContratoOtroSi(models.Model):
    Contrato = models.ForeignKey(contrato_local_vivienda, on_delete=models.CASCADE)
    firmaElectronicaArrendador = models.BooleanField(default=False) #arrendador
    firmaElectronicaArrendatario=models.BooleanField(default=False)
    otroSi_firmado = models.FileField(upload_to='otroSi_firmados/', null=True, blank=True)