from django.contrib import admin
from django.utils.html import format_html

from .models import ConsultaInmueble, Imagen_casa_arrendar, SolicitudPublicacion, Video_Casa, arrendar, arriendo


@admin.register(Imagen_casa_arrendar)
class Imagen_casa_arrendarAdmin(admin.ModelAdmin):
    list_display = ['arrendar', 'direccion', 'imagen_thumbnail', 'canonmensual', 'id']

    def imagen_thumbnail(self, obj):
        return format_html('<img src="{}" style="max-width: 100px; max-height: 100px;" />', obj.imagen.url)

    imagen_thumbnail.allow_tags = True
    imagen_thumbnail.short_description = 'Imagen'

    def direccion(self, obj):
        return obj.arrendar.direccion

    def canonmensual(self, obj):
        return obj.arrendar.canonmensual


@admin.register(Video_Casa)
class VideoCasaAdmin(admin.ModelAdmin):
    list_display = ['arrendar', 'video_preview', 'descripcion', 'id']

    def video_preview(self, obj):
        if obj.video_archivo:
            return format_html(
                '<video width="150" height="100" controls>'
                '<source src="{}" type="video/mp4">'
                'Tu navegador no soporta la reproducción de videos.'
                '</video>',
                obj.video_archivo.url
            )
        return "No disponible"

    video_preview.allow_tags = True
    video_preview.short_description = 'Vista previa del video'


@admin.register(arrendar)
class arrendarAdmin(admin.ModelAdmin):
    list_display = ['propietario', 'direccion', 'modalidad', 'publicar', 'verificada', 'destacada', 'vistas', 'imagen_thumbnail']
    list_filter = ['modalidad', 'publicar', 'verificada', 'destacada', 'ciudad']
    search_fields = ['direccion', 'barrio', 'ciudad']
    list_editable = ['publicar', 'verificada', 'destacada']
    readonly_fields = ['vistas', 'latitud', 'longitud']

    def imagen_thumbnail(self, obj):
        if not obj.fotoPrincipal:
            return '-'
        return format_html('<img src="{}" style="max-width: 100px; max-height: 100px;" />', obj.fotoPrincipal.url)

    imagen_thumbnail.allow_tags = True
    imagen_thumbnail.short_description = 'Imagen'


@admin.register(arriendo)
class arriendoAdmin(admin.ModelAdmin):
    pass


@admin.register(SolicitudPublicacion)
class SolicitudPublicacionAdmin(admin.ModelAdmin):
    list_display = ['creada', 'estado', 'nombre', 'telefono', 'modalidad', 'tipoInmueble', 'direccion', 'ciudad', 'foto_miniatura']
    list_filter = ['estado', 'modalidad', 'ciudad']
    search_fields = ['nombre', 'telefono', 'correo', 'direccion', 'barrio']
    readonly_fields = ['creada', 'foto_miniatura']
    actions = ['marcar_contactado']

    @admin.display(description='Foto')
    def foto_miniatura(self, obj):
        if not obj.foto:
            return '-'
        return format_html('<img src="{}" style="max-width: 100px; max-height: 100px;" />', obj.foto.url)

    @admin.action(description='Marcar como contactadas')
    def marcar_contactado(self, request, queryset):
        queryset.update(estado='contactado')


@admin.register(ConsultaInmueble)
class ConsultaInmuebleAdmin(admin.ModelAdmin):
    list_display = ['creada', 'estado', 'tipo', 'nombre', 'telefono', 'casa', 'fecha_visita']
    list_filter = ['estado', 'tipo']
    search_fields = ['nombre', 'telefono', 'correo', 'casa__direccion']
    readonly_fields = ['creada']
    actions = ['marcar_atendida']

    @admin.action(description='Marcar como atendidas')
    def marcar_atendida(self, request, queryset):
        queryset.update(estado='atendida')
