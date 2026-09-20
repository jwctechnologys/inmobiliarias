from django.contrib import admin
from django.utils.html import format_html

from .models import Imagen_casa_arrendar, Video_Casa, arrendar, arriendo


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
    list_display = ['propietario', 'direccion', 'imagen_thumbnail']

    def imagen_thumbnail(self, obj):
        return format_html('<img src="{}" style="max-width: 100px; max-height: 100px;" />', obj.fotoPrincipal.url)

    imagen_thumbnail.allow_tags = True
    imagen_thumbnail.short_description = 'Imagen'


@admin.register(arriendo)
class arriendoAdmin(admin.ModelAdmin):
    pass
