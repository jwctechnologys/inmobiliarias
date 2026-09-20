from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Clausula,
    FechaPago,
    ReporteInconformidad,
    ReportePagoRecibos,
    contrato_local_vivienda,
    imagenReporteNovedades,
    otroSi,
    reporteNovedades,
    videoReporteNovedades,
)


# Register your models here.
@admin.register(contrato_local_vivienda)
class contrato_local_viviendaAdmin(admin.ModelAdmin):
    list_display = ('id', 'fecha')

@admin.register(FechaPago)
class FechaPagoAdmin(admin.ModelAdmin):
    list_display = ('id', 'fecha_pago', 'estado_pago')

@admin.register(otroSi)
class otroSiAdmin(admin.ModelAdmin):
    list_display = ('id', 'contrato', 'fechainicio','fechafin','aceptaOtroSi')

@admin.register(Clausula)
class ClausulaAdmin(admin.ModelAdmin):
    list_display = ('id', 'texto')

class imagenReporteNovedadesInline(admin.TabularInline):
    model = imagenReporteNovedades
    extra = 1
    fields = ('imagen',)

class videoReporteNovedadesInline(admin.TabularInline):
    model = videoReporteNovedades
    extra = 0

    # Mostrar vista previa de los videos
    def video_preview(self, obj):
        if obj.video_archivo:
            return format_html(
                '<video width="200" controls><source src="{}" type="video/mp4">Your browser does not support the video tag.</video>',
                obj.video_archivo.url
            )
        return "No hay video disponible"

    video_preview.short_description = "Vista previa del video"
    fields = ('video_archivo', 'video_preview')  # Mostrar archivo y vista previa
    readonly_fields = ('video_preview',)


@admin.register(reporteNovedades)
class reporteNovedadesAdmin(admin.ModelAdmin):
    list_display = ('id', 'contratoNum', 'fechaReporte', 'texto', 'imagen_thumbnail', 'video_preview')
    inlines = [imagenReporteNovedadesInline, videoReporteNovedadesInline]

    # Para mostrar las imágenes en la lista de administración
    def imagen_thumbnail(self, obj):
        imagenes = imagenReporteNovedades.objects.filter(reporteNovedad=obj)
        if imagenes.exists():
            return format_html('<img src="{}" width="50" height="50" />', imagenes[0].imagen.url)  # Muestra la primera imagen
        return '-'
    imagen_thumbnail.short_description = 'Imagen'

    # Mostrar la vista previa del primer video en la lista
    def video_preview(self, obj):
        videos = videoReporteNovedades.objects.filter(reporteNovedad=obj)
        if videos.exists():
            return format_html(
                '<video width="50" controls><source src="{}" type="video/mp4">Your browser does not support the video tag.</video>',
                videos[0].video_archivo.url
            )  # Muestra el primer video
        return '-'
    video_preview.short_description = 'Video'

# Crear una clase personalizada para administrar ReportePagoRecibos en el admin
class ReportePagoRecibosAdmin(admin.ModelAdmin):
    list_display = (
        'reportePagoReciboContrato', 
        'imagenReciboLuz', 
        'imagenReciboAgua', 
        'imagenReciboGas', 
        'imagenReciboBioagricola'
    )
    
    # Agregar funcionalidad para ver imágenes en la lista de administradores
    def imagenReciboLuz(self, obj):
        if obj.imagenReciboLuz:
            return f'<img src="{obj.imagenReciboLuz.url}" width="100" />'
        return "-"
    imagenReciboLuz.allow_tags = True  # Hacer que se interprete como HTML

    def imagenReciboAgua(self, obj):
        if obj.imagenReciboAgua:
            return f'<img src="{obj.imagenReciboAgua.url}" width="100" />'
        return "-"
    imagenReciboAgua.allow_tags = True

    def imagenReciboGas(self, obj):
        if obj.imagenReciboGas:
            return f'<img src="{obj.imagenReciboGas.url}" width="100" />'
        return "-"
    imagenReciboGas.allow_tags = True

    def imagenReciboBioagricola(self, obj):
        if obj.imagenReciboBioagricola:
            return f'<img src="{obj.imagenReciboBioagricola.url}" width="100" />'
        return "-"
    imagenReciboBioagricola.allow_tags = True

# Registrar el modelo en el admin con la clase personalizada
admin.site.register(ReportePagoRecibos, ReportePagoRecibosAdmin)


@admin.register(ReporteInconformidad)
class ReporteInconformidadAdmin(admin.ModelAdmin):
    list_display = ('reporteinconformidad', 'estaInconforme', 'inconformidadSolucionada', 'Inconformidad')
    list_filter = ('estaInconforme', 'inconformidadSolucionada')
    search_fields = ('Inconformidad', 'reporteinconformidad__tipoContrato')  # Permite buscar por tipo de contrato
