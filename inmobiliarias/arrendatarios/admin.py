from django.contrib import admin

from .models import coarrendatario, declaracion_ingresos, dependientes, referencias


@admin.register(coarrendatario)
class coarrendatarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'tipo_documento', 'doc_identificacion', 'celular')


@admin.register(dependientes)
class dependientesAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'tipo_documento', 'doc_identificacion')


@admin.register(referencias)
class referenciasAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'parentezco', 'celular', 'refArrendadorAnterior')


@admin.register(declaracion_ingresos)
class declaracion_ingresosAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_usuario_nombre', 'salarioBasicoMensual', 'tipoContrato')
    list_filter = ('tipoContrato', 'declaraRenta')
    search_fields = ('usuario__user__username', 'jefeInmediato')
    list_per_page = 20

    def get_usuario_nombre(self, obj):
        """Muestra el nombre del usuario del arrendatario"""
        if obj.usuario and obj.usuario.user:
            return obj.usuario.user.username
        return "Sin usuario"
    get_usuario_nombre.short_description = "Usuario Arrendatario"

    fieldsets = (
        ('Información del Arrendatario', {
            'fields': ('usuario',)
        }),
        ('Información Laboral', {
            'fields': ('tipoContrato', 'jefeInmediato', 'tiempoLaboral', 'telefonoEmpresa', 'direccion_laboral')
        }),
        ('Información Financiera', {
            'fields': ('salarioBasicoMensual', 'otrosIngresos', 'declaraRenta')
        }),
    )
