from django.contrib import admin

from .models import AtributoProveedor, CalificacionArrendatario, CalificacionProveedor


@admin.register(CalificacionArrendatario)
class CalificacionArrendatarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'arrendatario', 'propietario', 'puntuacion', 'contrato', 'creada')
    list_filter = ('puntuacion',)
    search_fields = ('arrendatario__user__username', 'propietario__user__username')


@admin.register(CalificacionProveedor)
class CalificacionProveedorAdmin(admin.ModelAdmin):
    list_display = ('id', 'proveedor', 'propietario', 'puntuacion', 'casa', 'creada')
    list_filter = ('puntuacion', 'atributos')
    search_fields = ('proveedor__user__username', 'propietario__user__username')
    filter_horizontal = ('atributos',)


@admin.register(AtributoProveedor)
class AtributoProveedorAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre')
