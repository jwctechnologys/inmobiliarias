from django.contrib.auth.models import AbstractUser
from django.db import models

from .choices import Genero, TipoDocumento


class User(AbstractUser):
    customer_id = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)

    def say_hello(self):
        return "Hello, my name is {}".format(self.first_name)


class administrador(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='administrador')
    tipo_documento = models.CharField(max_length=3, choices=TipoDocumento.choices, blank=True, null=True)  # Permitir que este campo esté vacío
    doc_identificacion = models.IntegerField(blank=True, null=True)  # Permitir que este campo esté vacío
    lugarExpCedula = models.CharField(blank=True,max_length=255)
    CodClasificaIndustrialIU=models.IntegerField(blank=True, null=True)
    descActividadEconomica = models.CharField(blank=True,max_length=255)
    activo= models.BooleanField(default=True)
    genero = models.CharField(blank=True,null=True,max_length=1,choices=Genero.choices)
    direccion = models.CharField(max_length=255)
    barrio = models.CharField(blank=True,null=True, max_length=255)
    ciudad = models.CharField(blank=True,null=True, max_length=255)
    direccionCorrespondencia = models.CharField(blank=True, null=True, max_length=255)
    barrioCorrespondencia = models.CharField(blank=True,null=True, max_length=255)
    ciudadCorrespondencia = models.CharField(blank=True,null=True,max_length=255)    
    celular = models.PositiveBigIntegerField(null=True, blank=True)  # Permitir que este campo esté vacío
    celularDos = models.PositiveBigIntegerField(null=True, blank=True)  # Permitir que este campo esté vacío
    cuentaDaviplata = models.PositiveBigIntegerField(null=True, blank=True)
    cuentaNequi = models.PositiveBigIntegerField(null=True, blank=True) 
    llave = models.CharField(blank=True, null=True, max_length=40)
    CuentaBancolombia = models.PositiveBigIntegerField(null=True, blank=True)
    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name = "Administrador de aplicación"
        verbose_name_plural = "Administradores de la aplicación"


class propietario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='propietario')
    tipo_documento = models.CharField(max_length=3, choices=TipoDocumento.choices, blank=True, null=True)
    doc_identificacion = models.IntegerField(blank=True, null=True)
    lugarExpCedula = models.CharField(blank=True,null=True, max_length=255)
    descActividadEconomica = models.CharField(blank=True,null=True,max_length=255)
    CodClasificaIndustrialIU=models.IntegerField(blank=True, null=True)
    genero = models.CharField(blank=True,max_length=1,choices=Genero.choices)
    direccion = models.CharField(blank=True, null=True,max_length=255)
    barrio = models.CharField(blank=True,null=True, max_length=255)
    ciudad = models.CharField(blank=True,null=True, max_length=255)
    direccionCorrespondencia = models.CharField(blank=True, null=True, max_length=255)
    barrioCorrespondencia = models.CharField(blank=True, null=True, max_length=255)
    ciudadCorrespondencia = models.CharField(blank=True, null=True, max_length=255) 
    celular = models.PositiveBigIntegerField(null=True, blank=True)  # Permitir que este campo esté vacío
    celularDos = models.PositiveBigIntegerField(null=True, blank=True)  # Permitir que este campo esté vacío
    cuentaDaviplata = models.PositiveBigIntegerField(null=True, blank=True)
    activo= models.BooleanField(default=True)
    cuentaNequi = models.PositiveBigIntegerField(null=True, blank=True) 
    llave = models.CharField(blank=True, null=True, max_length=40)
    CuentaBancolombia = models.PositiveBigIntegerField(null=True, blank=True)
    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name = "Propietario de casa"
        verbose_name_plural = "Propietarios de casas"


class arrendatario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='arrendatario')
    tipo_documento = models.CharField(max_length=3, choices=TipoDocumento.choices, blank=True, null=True)
    doc_identificacion = models.IntegerField(blank=True, null=True)
    lugarExpCedula = models.CharField(blank=True,null=True,max_length=255)
    ocupacion = models.CharField(blank=True,null=True,max_length=255)
    estadoCivil = models.CharField(blank=True,null=True,max_length=255)
    empresa = models.CharField(blank=True,null=True,max_length=255)
    CodClasificaIndustrialIU=models.IntegerField(blank=True, null=True)
    descActividadEconomica = models.CharField(blank=True,null=True, max_length=255)
    genero = models.CharField(blank=True,max_length=1,choices=Genero.choices)
    direccion = models.CharField(blank=True,null=True,max_length=255)
    barrio = models.CharField(blank=True,null=True,max_length=255)
    ciudad = models.CharField(blank=True,null=True,max_length=255)
    direccionCorrespondencia = models.CharField(blank=True, max_length=255)
    barrioCorrespondencia = models.CharField(blank=True,max_length=255)
    ciudadCorrespondencia = models.CharField(blank=True,max_length=255) 
    activo= models.BooleanField(default=True)
    arrendatarioAprobado= models.BooleanField(default=False)
    celular = models.IntegerField(blank=True, null=True)
    celularDos = models.IntegerField(blank=True, null=True) 


    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name = "Arrendatario"
        verbose_name_plural = "Arrendatarios"


class proveedor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='proveedor')
    tipo_documento = models.CharField(max_length=3, choices=TipoDocumento.choices, blank=True, null=True)
    doc_identificacion = models.IntegerField(blank=True, null=True)
    lugarExpCedula = models.CharField(blank=True,null=True,max_length=255)
    genero = models.CharField(blank=True,null=True,max_length=1,choices=Genero.choices)
    direccion = models.CharField(blank=True,null=True,max_length=255)
    barrio = models.CharField(blank=True,null=True,max_length=255)
    ciudad = models.CharField(blank=True,null=True,max_length=255)
    direccionCorrespondencia = models.CharField(blank=True, max_length=255)
    barrioCorrespondencia = models.CharField(blank=True,max_length=255)
    ciudadCorrespondencia = models.CharField(blank=True,max_length=255)     
    activo= models.BooleanField(default=True)
    celular = models.IntegerField(blank=True, null=True)
    celularDos = models.IntegerField(blank=True, null=True) 

    def __str__(self):
        return self.user.username
    
    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
