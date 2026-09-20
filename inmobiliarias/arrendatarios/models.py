from django.db import models

from usuarios.choices import Genero, TipoDocumento
from usuarios.models import arrendatario


class declaracion_ingresos(models.Model):
    usuario = models.ForeignKey(arrendatario, on_delete=models.CASCADE)
    tipoContrato = models.CharField(blank=True, null=True, max_length=255)
    jefeInmediato = models.CharField(blank=True, null=True, max_length=255)
    tiempoLaboral = models.CharField(blank=True, null=True, max_length=255)
    salarioBasicoMensual = models.CharField(blank=True, null=True, max_length=255)
    otrosIngresos = models.CharField(blank=True, null=True, max_length=255)
    telefonoEmpresa = models.CharField(blank=True, null=True, max_length=12)
    direccion_laboral = models.CharField(max_length=100, blank=True, null=True)
    declaraRenta = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    
    def __str__(self):
        # CORREGIDO: Usar user.username en lugar de username directamente
        if self.usuario and self.usuario.user:
            return f"Declaración de {self.usuario.user.username}"
        return f"Declaración sin usuario (ID: {self.id})"
    
    class Meta:
        verbose_name = "Declaración de ingresos arrendatario"
        verbose_name_plural = "Declaraciones de ingresos arrendatario"


class coarrendatario(models.Model):
    arrendatario = models.ForeignKey (arrendatario ,on_delete=models.CASCADE)
    first_name = models.CharField(max_length=50, blank=True, null=True)  
    last_name = models.CharField(max_length=50, blank=True, null=True) 
    tipo_documento = models.CharField(max_length=3, choices=TipoDocumento.choices, blank=True, null=True)
    doc_identificacion = models.IntegerField(blank=True, null=True)
    lugarExpCedula = models.CharField(blank=True,max_length=255)
    parentezco = models.CharField(max_length=30, blank=True, null=True) #Conyuge, Codeudor, Familiar o amigo
    celular = models.IntegerField(blank=True, null=True)
    email = models.EmailField(max_length=50, blank=True, null=True) 
    direccion = models.CharField(blank=True,max_length=255)
    barrio = models.CharField(blank=True,max_length=255)
    ciudad = models.CharField(blank=True,max_length=255)
    empresa = models.CharField(blank=True,max_length=255)
    ocupacion = models.CharField(blank=True,max_length=255)
    ingresosMensualesTotales = models.CharField(blank=True,max_length=15)
    declaraRenta = models.BooleanField(default = False)
    genero = models.CharField(blank=True,max_length=1,choices=Genero.choices)

    direccionCorrespondencia = models.CharField(blank=True, max_length=255)
    barrioCorrespondencia = models.CharField(blank=True,max_length=255)
    ciudadCorrespondencia = models.CharField(blank=True,max_length=255) 
    
    celularDos = models.IntegerField(null=True, blank=True) 

    def __str__(self):
        return f"{self.first_name} {self.last_name}" 
    
    class Meta:
        verbose_name = "Coarrendatario"


class dependientes(models.Model):
    arrendatario = models.ForeignKey(arrendatario, on_delete=models.CASCADE)
    first_name= models.CharField(max_length=30, blank=True, null=True)
    last_name= models.CharField(max_length=30, blank=True, null=True)
    edad = models.IntegerField(blank=True, null=True)
    tipo_documento = models.CharField(max_length=3, choices=TipoDocumento.choices, blank=True, null=True)
    doc_identificacion = models.PositiveBigIntegerField(null=True, blank=True)
    lugarExpCedula = models.CharField(blank=True, null=True, max_length=255)
    ocupacion = models.CharField(max_length=30, blank=True, null=True)
    parentezco = models.CharField(max_length=30, blank=True, null=True)
    
    def __str__(self):
       return self.arrendatario.user.first_name + self.arrendatario.user.first_name
    class Meta:
        verbose_name = "Personas dependientes del arrendatario"
        verbose_name_plural = "Personas dependientes del arrendatario"


class referencias(models.Model): 
    arrendatario = models.ForeignKey(arrendatario, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=30, blank=True, null=True)
    last_name = models.CharField(max_length=30, blank=True, null=True)    
    parentezco = models.CharField(max_length=30, blank=True, null=True)
    celular = models.IntegerField(blank=True, null=True)    
    dir_residencia = models.CharField(max_length=50, blank=True, null=True)
    ocupacion = models.CharField(max_length=30, blank=True, null=True)
    motivoRetiro = models.CharField(max_length=50, blank=True, null=True)
    refArrendadorAnterior = models.BooleanField(default=False)

    def __str__(self):
        # Si arrendatario tiene un campo user relacionado
        if self.arrendatario and hasattr(self.arrendatario, 'user') and self.arrendatario.user:
            return f"{self.arrendatario.user.username} - {self.first_name} {self.last_name}"
        elif self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        else:
            return f"Referencia {self.id}"
    
    class Meta:
        verbose_name = "Referencia del arrendatario"
        verbose_name_plural = "Referencias del arrendatario"
