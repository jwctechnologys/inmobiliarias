"""Quien puede leer y quien puede escribir sobre los inmuebles.

Leer es publico (es lo que muestra el portal) pero sin datos privados; escribir exige sesion iniciada y ser
administrador o el propietario del inmueble.
"""
from rest_framework.permissions import SAFE_METHODS, BasePermission


def es_administrador(usuario):
    return bool(usuario and usuario.is_authenticated and (usuario.is_superuser or usuario.groups.filter(name='administrador').exists()))


def es_propietario(usuario):
    return bool(usuario and usuario.is_authenticated and usuario.groups.filter(name='propietario').exists())


def es_gestor(usuario):
    """Puede registrar inmuebles: administrador o propietario."""
    return es_administrador(usuario) or es_propietario(usuario)


def es_dueno(usuario, casa):
    """El usuario es el propietario registrado de esa casa."""
    propietario = getattr(casa, 'propietario', None)
    return bool(usuario and usuario.is_authenticated and propietario is not None and propietario.user_id == usuario.id)


def casa_de(objeto):
    """La casa de un objeto: la propia casa, o la casa a la que pertenece una foto o un video."""
    return objeto if hasattr(objeto, 'propietario') else getattr(objeto, 'arrendar', None)


def puede_gestionar(usuario, objeto):
    return es_administrador(usuario) or es_dueno(usuario, casa_de(objeto))


class LecturaPublicaEscrituraGestor(BasePermission):
    """GET para todos. Crear, editar y borrar: solo administradores y propietarios (y de lo suyo)."""
    message = 'Inicia sesión como administrador o propietario para hacer este cambio.'

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return es_gestor(request.user)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return puede_gestionar(request.user, obj)


class SoloAdministrador(BasePermission):
    message = 'Solo los administradores pueden ver esto.'

    def has_permission(self, request, view):
        return es_administrador(request.user)
