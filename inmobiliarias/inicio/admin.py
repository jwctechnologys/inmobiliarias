from django.contrib import admin
from django.utils.html import format_html
from usuarios.admin import *
from usuarios.models import *
from .models import *
from django.utils.html import format_html
from .models import Video_Casa
# Register your models here.
#class ImagenAdmin(admin.ModelAdmin):
@admin.register(Imagen_casa_arrendar)
class Imagen_casa_arrendarAdmin(admin.ModelAdmin):
    list_display = ['arrendar','direccion', 'imagen_thumbnail','canonmensual', 'id']  # Lista de campos a mostrar en la tabla del admin

    def imagen_thumbnail(self, obj):
        #return format_html('<div style="display: flex; align-items: center;"><img src="{}" style="max-width: 100px; max-height: 100px; margin-right: 10px;" /><span>  {}    </span><span>{}</span></div>', obj.imagen.url, obj.arrendar.direccion,obj.arrendar.canonmensual)
        return format_html('<img src="{}" style="max-width: 100px; max-height: 100px;" />', obj.imagen.url)

    imagen_thumbnail.allow_tags = True
    imagen_thumbnail.short_description = 'Imagen'  # Título de la columna en la tabla del admin
    
    def direccion(self, obj):
         return obj.arrendar.direccion

    def canonmensual(self, obj):
        return obj.arrendar.canonmensual

@admin.register(Video_Casa)
class VideoCasaAdmin(admin.ModelAdmin):
    list_display = ['arrendar','video_preview', 'descripcion', 'id']  # Campos a mostrar

    def video_preview(self, obj):
        # Crear un elemento `<video>` para previsualizar el video
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
    video_preview.short_description = 'Vista previa del video'  # Título de la columna


#admin.site.register(arrendar)
@admin.register(arrendar)
class arrendarAdmin(admin.ModelAdmin):
    list_display = ['propietario', 'direccion','imagen_thumbnail']  # Lista de campos a mostrar en la tabla del admin

    def imagen_thumbnail(self, obj):
        #return format_html('<div style="display: flex; align-items: center;"><img src="{}" style="max-width: 100px; max-height: 100px; margin-right: 10px;" /><span>  {}    </span><span>{}</span></div>', obj.imagen.url, obj.arrendar.direccion,obj.arrendar.canonmensual)
        return format_html('<img src="{}" style="max-width: 100px; max-height: 100px;" />', obj.fotoPrincipal.url)

    imagen_thumbnail.allow_tags = True
    imagen_thumbnail.short_description = 'Imagen'  # Título de la columna en la tabla del admin
    def direccion(self, obj):
         return obj.arrendar.direccion

    def canonmensual(self, obj):
        return obj.arrendar.canonmensual


#admin.site.register(arriendo)

@admin.register(arriendo)
class arriendoAdmin(admin.ModelAdmin):
    pass 
   

#@admin.register(dependientes)
#class dependientesAdmin(admin.ModelAdmin):
 #   list_display = ('nombres_completos', 'arrendatario','parentezco')


class SolicitudAdmin(admin.ModelAdmin):
    list_display = ('casa', 'usuario', 'fecha', 'estado')  # Define qué campos se mostrarán en la lista
    list_filter = ('estado', 'fecha')  # Filtros para la interfaz
    search_fields = ('casa__direccion', 'usuario__nombre')  # Permite buscar por la dirección de la casa y el nombre del usuario

# Registra el modelo en el admin
admin.site.register(Solicitud, SolicitudAdmin)