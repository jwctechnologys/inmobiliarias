from django.contrib import admin

from .models import Solicitud


@admin.register(Solicitud)
class SolicitudAdmin(admin.ModelAdmin):
    list_display = ('casa', 'usuario', 'fecha', 'estado')
    list_filter = ('estado', 'fecha')
    search_fields = ('casa__direccion', 'usuario__user__username')
