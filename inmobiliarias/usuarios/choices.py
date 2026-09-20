from django.db import models


class TipoDocumento(models.TextChoices):
    CEDULA = "CC", "Cédula"
    CEDULA_EXTRANJERIA = "CE", "Cédula de extranjería"
    REGISTRO_CIVIL = "RC", "Registro civil"
    TARJETA_IDENTIDAD = "TI", "Tarjeta de identidad"
    DNI = "DNI", "Documento de identificación nacional"


class Genero(models.TextChoices):
    MASCULINO = "M", "Masculino"
    FEMENINO = "F", "Femenino"
