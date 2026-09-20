from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Avg, Count

from contratos.models import contrato_local_vivienda
from inmuebles.models import arrendar
from usuarios.models import arrendatario, propietario, proveedor


class CalificacionQuerySet(models.QuerySet):
    def resumen(self):
        """Promedio y cantidad de calificaciones, p. ej. para mostrar como referencia:
        CalificacionArrendatario.objects.filter(arrendatario=a).resumen()"""
        return self.aggregate(promedio=Avg('puntuacion'), total=Count('id'))


class Calificacion(models.Model):
    """Campos comunes a toda calificacion (base abstracta)."""
    puntuacion = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="De 1 (muy mala) a 5 (excelente).",
    )
    comentario = models.TextField(max_length=500, blank=True)
    creada = models.DateTimeField(auto_now_add=True)

    objects = CalificacionQuerySet.as_manager()

    class Meta:
        abstract = True
        ordering = ['-creada']


class CalificacionArrendatario(Calificacion):
    """Un propietario califica a un arrendatario. Sirve de referencia cuando otro
    propietario evalua una solicitud de ese arrendatario."""
    propietario = models.ForeignKey(
        propietario, on_delete=models.CASCADE, related_name='calificaciones_a_arrendatarios')
    arrendatario = models.ForeignKey(
        arrendatario, on_delete=models.CASCADE, related_name='calificaciones')
    # Contrato que respalda la calificacion (opcional mientras el flujo de contratos se completa).
    contrato = models.ForeignKey(
        contrato_local_vivienda, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='calificaciones_arrendatario')

    class Meta(Calificacion.Meta):
        verbose_name = "Calificación del arrendatario"
        verbose_name_plural = "Calificaciones del arrendatario"
        constraints = [
            models.UniqueConstraint(
                fields=['propietario', 'arrendatario', 'contrato'],
                name='calificacion_arrendatario_unica_por_contrato'),
        ]

    def __str__(self):
        return f"{self.arrendatario} - {self.puntuacion}/5 (por {self.propietario})"


class AtributoProveedor(models.Model):
    """Catalogo de cualidades que se pueden marcar a un proveedor: responsable, diligente..."""
    codigo = models.SlugField(max_length=30, unique=True)
    nombre = models.CharField(max_length=50)

    class Meta:
        verbose_name = "Cualidad de proveedor"
        verbose_name_plural = "Cualidades de proveedor"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class CalificacionProveedor(Calificacion):
    """Un propietario califica el trabajo de un proveedor en un arreglo de una casa."""
    propietario = models.ForeignKey(
        propietario, on_delete=models.CASCADE, related_name='calificaciones_a_proveedores')
    proveedor = models.ForeignKey(
        proveedor, on_delete=models.CASCADE, related_name='calificaciones')
    casa = models.ForeignKey(
        arrendar, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='calificaciones_proveedor')
    atributos = models.ManyToManyField(AtributoProveedor, blank=True, related_name='calificaciones')

    class Meta(Calificacion.Meta):
        verbose_name = "Calificación del proveedor"
        verbose_name_plural = "Calificaciones del proveedor"

    def __str__(self):
        return f"{self.proveedor} - {self.puntuacion}/5 (por {self.propietario})"
