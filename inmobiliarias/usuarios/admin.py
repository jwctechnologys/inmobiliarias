from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User
from .models import *

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('id', 'username', 'email', 'first_name', 'last_name')

    fieldsets = BaseUserAdmin.fieldsets + (
        (None, {'fields': ('customer_id',)}),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (None, {'fields': ('customer_id',)}),
    )

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)

        if 'password' in form.base_fields:
            form.base_fields['password'].widget.attrs.update({'readonly': False})

        return form

# Register your models here.
#admin.site.register(administrador)
@admin.register(administrador)
class administradorAdmin(admin.ModelAdmin):
    list_display = ('id','user', 'tipo_documento', 'doc_identificacion', 'celular')
@admin.register(propietario)
class propietarioAdmin(admin.ModelAdmin):
    list_display = ('user', 'tipo_documento', 'doc_identificacion', 'celular')

@admin.register(arrendatario)
class arrendatarioAdmin(admin.ModelAdmin):
    list_display = ('id','user', 'tipo_documento', 'doc_identificacion', 'celular')

@admin.register(proveedor)
class proveedorAdmin(admin.ModelAdmin):
    llist_display = ('id', 'user', 'tipo_documento', 'doc_identificacion', 'celular')

@admin.register(coarrendatario)
class coarrendatarioAdmin(admin.ModelAdmin):
    list_display = ('id','first_name','last_name','tipo_documento', 'doc_identificacion', 'celular')

@admin.register(dependientes)
class dependientesAdmin(admin.ModelAdmin):
    list_display = ('id','first_name','last_name','tipo_documento', 'doc_identificacion')

@admin.register(referencias)
class referenciasAdmin(admin.ModelAdmin):
    list_display = ('id','first_name','last_name','parentezco', 'celular','refArrendadorAnterior')

#admin.site.register(declaracion_ingresos)
@admin.register(declaracion_ingresos)
class declaracion_ingresosAdmin(admin.ModelAdmin):
    # CORREGIDO: Usar usuario.user.username en lugar de usuario.username
    list_display = ('id', 'get_usuario_nombre', 'salarioBasicoMensual', 'tipoContrato')
    list_filter = ('tipoContrato', 'declaraRenta')
    search_fields = ('usuario__user__username', 'jefeInmediato')  # CORREGIDO
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

#admin.site.register(propietario)
#@admin.register(propietario)
#class propietarioAdmin(admin.ModelAdmin):
   #list_display = ('username', 'first_name','email')

#admin.site.register(declaracion_ingresos)
#@admin.register(declaracion_ingresos)
#class declaracion_ingresosAdmin(admin.ModelAdmin):
     #list_display = ('username', 'ocupacion','entidad_labora','celular_empresa')
#admin.site.register(coarrendatario)
#@admin.register(coarrendatario)
#class coarrendatarioAdmin(admin.ModelAdmin):
    #list_display = ('Username', 'celular','arrendatario','empresa')


#admin.site.register(dependientes)
#@admin.register(dependientes)
#class dependientesAdmin(admin.ModelAdmin):
   #list_display = ('nombres_completos', 'arrendatario','parentezco')

#admin.site.register(contactos)
#@admin.register(contactos)
#class contactosAdmin(admin.ModelAdmin):
    #list_display = ('nombres_completos', 'celular','arrendatario','parentesco')
#admin.site.register(arrendatario)
#class declaracion_ingresosInstanceInline(admin.TabularInline):
    #model = declaracion_ingresos
    #extra = 0
#class coarrendatarioInstanceInline(admin.TabularInline):
    #model = coarrendatario
    #extra = 0
#class dependientesInstanceInline(admin.TabularInline):
    #model = dependientes
    #extra = 0
#class contactosInstanceInline(admin.TabularInline):
    #model = contactos
    #extra = 0

#@admin.register(arrendatario)
#class arrendatarioAdmin(admin.ModelAdmin):
   #list_display = ('nombres_completos', 'celular','email','arrendatarioactivo')
   #inlines=[declaracion_ingresosInstanceInline,coarrendatarioInstanceInline,dependientesInstanceInline,contactosInstanceInline]
    

#admin.site.register(proveedor)
#admin.site.register(calificacion_arrendatario)
#admin.site.register(calificacion_proveedor)