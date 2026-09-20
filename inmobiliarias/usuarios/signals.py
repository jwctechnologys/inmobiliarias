import logging

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_migrate, post_save
from django.dispatch import receiver

from .models import User, administrador, arrendatario, propietario, proveedor

logger = logging.getLogger(__name__)

# Grupo (rol) -> modelo de perfil que se crea junto con el usuario.
PERFIL_POR_GRUPO = {
    'administrador': administrador,
    'propietario': propietario,
    'arrendatario': arrendatario,
    'proveedor': proveedor,
}

# Permisos sobre User que recibe cada grupo al migrar.
PERMISOS_POR_GRUPO = {
    'administrador': ['add_user', 'change_user', 'delete_user', 'view_user'],
    'propietario': ['view_user'],
    'arrendatario': ['view_user'],
    'proveedor': ['view_user'],
}


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Al crear un usuario, crea el perfil que corresponde a su grupo (rol)."""
    if not created:
        return
    grupos = instance.groups.all()
    logger.debug("Grupos del usuario %s: %s", instance.pk, list(grupos))
    for nombre, modelo in PERFIL_POR_GRUPO.items():
        if grupos.filter(name=nombre).exists():
            logger.info("Creando perfil %s para el usuario %s", nombre, instance.pk)
            modelo.objects.create(user=instance)
            break


@receiver(post_migrate)
def create_default_groups(sender, **kwargs):
    """Tras migrar la app usuarios, asegura que existan los grupos y sus permisos."""
    if sender.name != 'usuarios':
        return

    user_content_type = ContentType.objects.get_for_model(User)

    for nombre_grupo, permisos in PERMISOS_POR_GRUPO.items():
        group, _ = Group.objects.get_or_create(name=nombre_grupo)
        for permiso in permisos:
            permission, _ = Permission.objects.get_or_create(
                codename=permiso,
                defaults={
                    'name': f'Can {permiso.replace("_", " ")} user',
                    'content_type': user_content_type,
                },
            )
            group.permissions.add(permission)
        group.save()
