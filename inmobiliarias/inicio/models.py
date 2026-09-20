from django.db import models
from usuarios.models import *
# Create your models here.

class Casa(models.Model):
    id = models.AutoField(primary_key=True)
    propietario = models.ForeignKey (propietario ,on_delete=models.CASCADE)
    matriculaInmobiliaria =models.CharField(blank=True, max_length=100)
    tipoInmueble = models.CharField(blank=True, max_length=100) #Casa, Apartamento, Habitacion, Local
    usoInmueble = models.CharField(blank=True, max_length=100) #Vivienda, Comercial
    direccion = models.CharField(max_length=100)
    barrio = models.CharField(blank=True, max_length=100)
    ciudad = models.CharField(blank=True, max_length=50)
    descripcion = models.TextField(blank=True,null=True)  #venta, arriendo, arrendada, vendida
    condiciones = models.TextField(blank=True,null=True)  #venta, arriendo, arrendada, vendida
    con_administracion= models.BooleanField(default=False)
    fotoPrincipal= models.ImageField(upload_to='media/', null=True)
    publicar = models.BooleanField(default=False)  #
    arrendada = models.BooleanField(default=False)
    solicitudAceptada = models.BooleanField(default=False)
    conCodeudor = models.BooleanField(default=True)  #Activo si codeusor, false Alternativo
    fecha = models.DateTimeField(null=True, blank=True)

    class Meta:
       abstract = True 

class arrendar(Casa):
    canonmensual = models.IntegerField()
    observacion_canonmensual = models.TextField(blank=True)
    deposito = models.IntegerField(blank=True, null=True)
    observacion_deposito = models.TextField(blank=True)
    sala= models.BooleanField(default=False)
    observacion_sala = models.TextField(blank=True)
    comedor= models.BooleanField(default=False)
    observacion_comedor = models.TextField(blank=True)
    cocina= models.BooleanField(default=False)
    observacion_cocina = models.TextField(blank=True)
    habitaciones= models.BooleanField(default=False)
    observacion_habitaciones = models.TextField(blank=True)
    baños= models.BooleanField(default=False)
    observacion_baños = models.TextField(blank=True)
    patio= models.BooleanField(default=False)
    observacion_patio = models.TextField(blank=True)
    garage= models.BooleanField(default=False)
    observacion_garage = models.TextField(blank=True)
    tanquesubterraneo= models.BooleanField(default=False)
    observacion_tanquesubterraneo = models.TextField(blank=True)
    ser_agua= models.BooleanField(default=False)
    observacion_ser_agua = models.TextField(blank=True)
    ser_energia= models.BooleanField(default=False)
    observacion_ser_energia = models.TextField(blank=True)
    ser_gas_domiciliario= models.BooleanField(default=False)
    observacion_ser_gas_domiciliario = models.TextField(blank=True)
    ser_bioagricola= models.BooleanField(default=False)
    observacion_ser_bioagricola = models.TextField(blank=True) 
    otros =  models.TextField(max_length=100,blank=True)
    #def __str__(self):
    #   return f"{self.direccion} - {self.propietario.username}"
    class Meta:
        verbose_name = "Casa registrada para arrendar"
        verbose_name_plural = "Casas registradas para arrendar"    

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
    cedulaArrendatario = models.FileField(upload_to='media/cedulas/', null=True, blank=True)
    cedulaCodeudor = models.FileField(upload_to='media/cedulas/', null=True, blank=True)
    cedulasHabitantes = models.FileField(upload_to='media/cedulas/habitantes/', null=True, blank=True)
    aceptaTratamientodeDatos = models.BooleanField(default = False)
    # Documentos laborales
    certificado_laboral_arrendatario = models.FileField(upload_to='media/laborales/', null=True, blank=True)
    certificado_laboral_codeudor = models.FileField(upload_to='media/laborales/', null=True, blank=True)
    
    desprendible_nomina_arrendatario = models.FileField(upload_to='media/nominas/', null=True, blank=True)
    desprendible_nomina_codeudor = models.FileField(upload_to='media/nominas/', null=True, blank=True)
    
    # Documentos financieros
    declaracion_renta_arrendatario = models.FileField(upload_to='media/renta/', null=True, blank=True)
    declaracion_renta_codeudor = models.FileField(upload_to='media/renta/', null=True, blank=True)
    
    # Documentos comerciales (para independientes)
    camara_comercio_arrendatario = models.FileField(upload_to='media/comercio/', null=True, blank=True)
    camara_comercio_codeudor = models.FileField(upload_to='media/comercio/', null=True, blank=True)

    class Meta:
        unique_together = ('casa', 'usuario')  # Prevenir solicitudes duplicadas para la misma casa


class Imagen_casa_arrendar(models.Model):
    arrendar = models.ForeignKey(arrendar, on_delete=models.CASCADE)
    descripcion = models.TextField(blank=True,null=True) 
    imagen = models.ImageField(upload_to='media/casa/imagenes')
    #def __str__(self):
     #  return f"{self.arrendar.direccion} - {self.arrendar.propietario.username}"
    class Meta:
        verbose_name = "Mas fotos de las casas registradas"
        verbose_name_plural = "Mas fotos de las casas registradas"

class Video_Casa(models.Model): 
    arrendar = models.ForeignKey(arrendar, on_delete=models.CASCADE)
    descripcion = models.TextField(blank=True,null=True) 
    video_archivo = models.FileField(upload_to='casa/videos') 
    def __str__(self):
        # Devuelve una descripción significativa del objeto
        return self.descripcion or f"Video {self.id}"

class arriendo(models.Model):
    arrendar = models.ForeignKey(arrendar, on_delete=models.CASCADE)
    #arrendatario = models.ForeignKey (arrendatario ,on_delete=models.CASCADE)
    #coarrendatario = models.ForeignKey (coarrendatario ,on_delete=models.CASCADE)

    solicitud_form_orig= models.BooleanField(default=False)
    Inventario= models.BooleanField(default=False)
    Registro_fotografico= models.BooleanField(default=False)
    Visita_verificacion= models.BooleanField(default=False)
    Verificacion_pagos_servicios= models.BooleanField(default=False)
    Notificacion_renova_cancela= models.BooleanField(default=False)
    Documentos_ident_arrendatario= models.BooleanField(default=False)
    firma_letras= models.BooleanField(default=False)

    class Meta:
        verbose_name = "Informacion de arriendos en curso"
        verbose_name_plural = "Informacion de arriendos en curso"