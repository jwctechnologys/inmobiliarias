from django.db import models

from inmobiliarias.storage import private_media_storage
from inmuebles.models import arrendar
from usuarios.models import arrendatario


class Solicitud(models.Model):
    casa = models.ForeignKey(arrendar, related_name="solicitudes", on_delete=models.CASCADE)
    usuario = models.ForeignKey(arrendatario, related_name="solicitudes", on_delete=models.CASCADE)
    idCoarrendatario = models.IntegerField(blank=True,)
    idsDependientes = models.JSONField(blank=True, default=list)
    idsReferencias = models.JSONField(blank=True, default=list)
    idDeclaracionIngresos = models.IntegerField(blank=True, null=True) 
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=[("pendiente", "Pendiente"), ("aceptada", "Aceptada"), ("rechazada", "Rechazada"), ("cancelada", "Cancelada"), ("contratada", "Contratada")], default="pendiente")
    solicitudAtendida= models.BooleanField(default = False)
    solicitudContratada= models.BooleanField(default = False)
    solicitudRevisada= models.BooleanField(default = False) #para no tener en cuenta filtrar con ese estado
    comentario_estado = models.CharField(max_length=200, blank=True,null=True)
    duracionContrato=models.IntegerField(default=6)
    seguroArrendamiento = models.BooleanField(blank=True,null=True)
    depositoVoluntario = models.BooleanField(blank=True,null=True)
    valorDepositoVoluntario = models.CharField(max_length=10, blank=True,null=True)
    otraGarantiaAcrodada = models.BooleanField(blank=True,null=True)
    especificacionOtraGarantiaAcordada = models.CharField(max_length=200, blank=True,null=True)
    mascotas = models.BooleanField(default = False)
    numMascotas= models.IntegerField(blank=True,null=True)
    tipoMascotas= models.CharField(blank=True,null=True)
    cedulaArrendatario = models.FileField(upload_to='media/cedulas/', storage=private_media_storage, null=True, blank=True)
    cedulaCodeudor = models.FileField(upload_to='media/cedulas/', storage=private_media_storage, null=True, blank=True)
    cedulasHabitantes = models.FileField(upload_to='media/cedulas/habitantes/', storage=private_media_storage, null=True, blank=True)
    aceptaTratamientodeDatos = models.BooleanField(default = False)
    # Documentos laborales
    certificado_laboral_arrendatario = models.FileField(upload_to='media/laborales/', storage=private_media_storage, null=True, blank=True)
    certificado_laboral_codeudor = models.FileField(upload_to='media/laborales/', storage=private_media_storage, null=True, blank=True)
    
    desprendible_nomina_arrendatario = models.FileField(upload_to='media/nominas/', storage=private_media_storage, null=True, blank=True)
    desprendible_nomina_codeudor = models.FileField(upload_to='media/nominas/', storage=private_media_storage, null=True, blank=True)
    
    # Documentos financieros
    declaracion_renta_arrendatario = models.FileField(upload_to='media/renta/', storage=private_media_storage, null=True, blank=True)
    declaracion_renta_codeudor = models.FileField(upload_to='media/renta/', storage=private_media_storage, null=True, blank=True)
    
    # Documentos comerciales (para independientes)
    camara_comercio_arrendatario = models.FileField(upload_to='media/comercio/', storage=private_media_storage, null=True, blank=True)
    camara_comercio_codeudor = models.FileField(upload_to='media/comercio/', storage=private_media_storage, null=True, blank=True)

    class Meta:
        unique_together = ('casa', 'usuario')  # Prevenir solicitudes duplicadas para la misma casa
