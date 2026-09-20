from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, administrador, arrendatario, propietario, proveedor


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


@admin.register(administrador)
class administradorAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'tipo_documento', 'doc_identificacion', 'celular')


@admin.register(propietario)
class propietarioAdmin(admin.ModelAdmin):
    list_display = ('user', 'tipo_documento', 'doc_identificacion', 'celular')


@admin.register(arrendatario)
class arrendatarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'tipo_documento', 'doc_identificacion', 'celular')


@admin.register(proveedor)
class proveedorAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'tipo_documento', 'doc_identificacion', 'celular')
