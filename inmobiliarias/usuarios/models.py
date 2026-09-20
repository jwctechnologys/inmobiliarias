from django.contrib.auth.models import AbstractUser, Permission, Group
from django.db import models
# Create your models here.
class User(AbstractUser):
    customer_id = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)

    def say_hello(self):
        return "Hello, my name is {}".format(self.first_name)

"""class Usuario (User):
    OPCIONES_DOCUMENTO = [
        ('CC', 'Cedula'),
        ('CE', 'Cedula extranjeria'),
        ('RC', 'Registro civil'),
        ('TI', 'Tarjeta de identidad'),
        ('DNI', 'Documento de identificacion nacional')
    ]
    
    tipo_documento = models.CharField(max_length=3, choices=OPCIONES_DOCUMENTO)
    doc_identificacion = models.IntegerField()
    celular = models.IntegerField()
    class Meta:
       abstract = True """

class administrador(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='administrador')
    tipo_documento = models.CharField(max_length=3, choices=[
        ('CC', 'Cédula'),
        ('CE', 'Cédula de extranjería'),
        ('RC', 'Registro civil'),
        ('TI', 'Tarjeta de identidad'),
        ('DNI', 'Documento de identificación nacional')
    ], blank=True, null=True)  # Permitir que este campo esté vacío
    doc_identificacion = models.IntegerField(blank=True, null=True)  # Permitir que este campo esté vacío
    lugarExpCedula = models.CharField(blank=True,max_length=255)
    CodClasificaIndustrialIU=models.IntegerField(blank=True, null=True)
    descActividadEconomica = models.CharField(blank=True,max_length=255)
    activo= models.BooleanField(default=True)
    genero = models.CharField(blank=True,null=True,max_length=1,choices=[
        ('M', 'Masculino'),
        ('F', 'Femenino')
    ])
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
    #def save(self, *args, **kwargs):
        #self.groups.add(Group.objects.get(name='administrador'))
        #super().save(*args, **kwargs)



class propietario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='propietario')
    tipo_documento = models.CharField(max_length=3, choices=[
        ('CC', 'Cedula'),
        ('CE', 'Cedula extranjeria'),
        ('RC', 'Registro civil'),
        ('TI', 'Tarjeta de identidad'),
        ('DNI', 'Documento de identificacion nacional')
    ], blank=True, null=True)
    doc_identificacion = models.IntegerField(blank=True, null=True)
    lugarExpCedula = models.CharField(blank=True,null=True, max_length=255)
    descActividadEconomica = models.CharField(blank=True,null=True,max_length=255)
    CodClasificaIndustrialIU=models.IntegerField(blank=True, null=True)
    genero = models.CharField(blank=True,max_length=1,choices=[
        ('M', 'Masculino'),
        ('F', 'Femenino')
    ])
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

    #def save(self, *args, **kwargs):
        #self.groups.add(Group.objects.get(name='propietario'))
        #super().save(*args, **kwargs)
    
    
class arrendatario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='arrendatario')
    tipo_documento = models.CharField(max_length=3, choices=[
        ('CC', 'Cedula'),
        ('CE', 'Cedula extranjeria'),
        ('RC', 'Registro civil'),
        ('TI', 'Tarjeta de identidad'),
        ('DNI', 'Documento de identificacion nacional')
    ], blank=True, null=True)
    doc_identificacion = models.IntegerField(blank=True, null=True)
    lugarExpCedula = models.CharField(blank=True,null=True,max_length=255)
    ocupacion = models.CharField(blank=True,null=True,max_length=255)
    estadoCivil = models.CharField(blank=True,null=True,max_length=255)
    empresa = models.CharField(blank=True,null=True,max_length=255)
    CodClasificaIndustrialIU=models.IntegerField(blank=True, null=True)
    descActividadEconomica = models.CharField(blank=True,null=True, max_length=255)
    genero = models.CharField(blank=True,max_length=1,choices=[
        ('M', 'Masculino'),
        ('F', 'Femenino')
    ])
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
    #def save(self, *args, **kwargs):
        #self.groups.add(Group.objects.get(name='administrador'))
        #super().save(*args, **kwargs)
class declaracion_ingresos(models.Model):
    usuario = models.ForeignKey('arrendatario', on_delete=models.CASCADE)
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
"""class coarrendatario(arrendatario):  
    arrendatario_User = models.ForeignKey(arrendatario, on_delete=models.CASCADE)
    empresa = models.CharField(max_length=100)
    observaciones = models.TextField(max_length=100)
    def __str__(self):
       return self.username
    class Meta:
        verbose_name = "Coarrendatario"
        verbose_name_plural = "Coarrendatarios"  """   

class coarrendatario(models.Model):
    arrendatario = models.ForeignKey (arrendatario ,on_delete=models.CASCADE)
    first_name = models.CharField(max_length=50, blank=True, null=True)  
    last_name = models.CharField(max_length=50, blank=True, null=True) 
    tipo_documento = models.CharField(max_length=3, choices=[
        ('CC', 'Cedula'),
        ('CE', 'Cedula extranjeria'),
        ('RC', 'Registro civil'),
        ('TI', 'Tarjeta de identidad'),
        ('DNI', 'Documento de identificacion nacional')
    ], blank=True, null=True)
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
    genero = models.CharField(blank=True,max_length=1,choices=[
        ('M', 'Masculino'),
        ('F', 'Femenino')
    ])

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
    tipo_documento = models.CharField(max_length=3, choices=[
        ('CC', 'Cedula'),
        ('CE', 'Cedula extranjeria'),
        ('RC', 'Registro civil'),
        ('TI', 'Tarjeta de identidad'),
        ('DNI', 'Documento de identificacion nacional')
    ], blank=True, null=True)
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
    
class proveedor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='proveedor')
    tipo_documento = models.CharField(max_length=3, choices=[
        ('CC', 'Cedula'),
        ('CE', 'Cedula extranjeria'),
        ('RC', 'Registro civil'),
        ('TI', 'Tarjeta de identidad'),
        ('DNI', 'Documento de identificacion nacional')
    ], blank=True, null=True)
    doc_identificacion = models.IntegerField(blank=True, null=True)
    lugarExpCedula = models.CharField(blank=True,null=True,max_length=255)
    genero = models.CharField(blank=True,null=True,max_length=1,choices=[
        ('M', 'Masculino'),
        ('F', 'Femenino')
    ])
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
    
"""  
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='proveedor')
    nombre_usuario = models.CharField(max_length=50)
    profesion = models.CharField(max_length=50)
    actividad = models.CharField(max_length=100)
    activo = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"""
    #def save(self, *args, **kwargs):
        #self.groups.add(Group.objects.get(name='administrador'))
        #super().save(*args, **kwargs)

class calificacion_arrendatario(models.Model):
    propietario= models.ForeignKey(propietario, on_delete=models.CASCADE)
    usuario = models.ForeignKey(arrendatario, on_delete=models.CASCADE)
    calificacion = models.IntegerField()
    desc_calificacion = models.TextField(max_length=200)
    def __str__(self):
       return self.usuario.username
    class Meta:
        verbose_name = "Calificacion del arrendatario"
        verbose_name_plural = "Calificaciones del arrendatario"
    
class calificacion_proveedor(models.Model):
    propietario= models.ForeignKey(propietario, on_delete=models.CASCADE)
    usuario = models.ForeignKey(arrendatario, on_delete=models.CASCADE)
    calificacion = models.IntegerField()
    desc_calificacion = models.TextField(max_length=200)
    def __str__(self):
       return self.usuario.username
    class Meta:
        verbose_name = "Calificacion del proveedor"
        verbose_name_plural = "Calificaciones del proveedor"    
   



