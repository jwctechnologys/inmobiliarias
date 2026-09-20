from django.db.models.signals import post_migrate, post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.apps import apps
from .models import User,administrador, propietario, arrendatario, proveedor

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        grupos = instance.groups.all()
        print(f"User groups: {grupos}")  # Para verificar los grupos

        if grupos.filter(name='administrador').exists():
            print("Creating administrador profile")
            administrador.objects.create(user=instance)
        elif grupos.filter(name='propietario').exists():
            print("Creating propietario profile")
            propietario.objects.create(user=instance)
        elif grupos.filter(name='arrendatario').exists():
            print("Creating arrendatario profile")
            arrendatario.objects.create(user=instance)
        elif grupos.filter(name='proveedor').exists():
            print("Creating proveedor profile")
            proveedor.objects.create(user=instance)

@receiver(post_migrate)
def create_default_groups(sender, **kwargs):
    if sender.name == 'usuarios':
        grupos_permisos = {
            'administrador': ['add_user', 'change_user', 'delete_user', 'view_user'],
            'propietario': ['view_user'],
            'arrendatario': ['view_user'],
            'proveedor': ['view_user']
        }

        user_content_type = ContentType.objects.get_for_model(User)

        for nombre_grupo, permisos in grupos_permisos.items():
            group, created = Group.objects.get_or_create(name=nombre_grupo)
            for permiso in permisos:
                permission, created = Permission.objects.get_or_create(
                    codename=permiso,
                    defaults={
                        'name': f'Can {permiso.replace("_", " ")} user',
                        'content_type': user_content_type
                    }
                )
                group.permissions.add(permission)
            group.save()
"""@receiver(post_migrate)
def create_default_groups(sender, **kwargs):
    if sender.name == 'usuarios':
        grupos_permisos = {
            'administrador': ['add_user', 'change_user', 'delete_user', 'view_user'],
            'propietario': ['view_user'],
            'arrendatario': ['view_user'],
            'proveedor': ['view_user']
        }

        user_content_type = ContentType.objects.get_for_model(apps.get_model('usuarios', 'User'))

        for nombre_grupo, permisos in grupos_permisos.items():
            group, created = Group.objects.get_or_create(name=nombre_grupo)
            for permiso in permisos:
                permission, created = Permission.objects.get_or_create(
                    codename=permiso,
                    defaults={
                        'name': f'Can {permiso.replace("_", " ")} user',
                        'content_type': user_content_type
                    }
                )
                group.permissions.add(permission)
            group.save()

@receiver(post_save, sender=apps.get_model('usuarios', 'User'))
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        print(instance.groups.all()) 
        # Verifica si el usuario pertenece a un grupo específico y crea la instancia correspondiente
        if instance.groups.filter(name='administrador').exists():
            administrador.objects.create(user=instance)
        elif instance.groups.filter(name='propietario').exists():
            propietario.objects.create(user=instance)
        elif instance.groups.filter(name='arrendatario').exists():
            arrendatario.objects.create(user=instance)
        elif instance.groups.filter(name='proveedor').exists():
            proveedor.objects.create(user=instance) """