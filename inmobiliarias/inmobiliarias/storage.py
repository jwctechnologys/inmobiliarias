from django.core.files.storage import storages


def private_media_storage():
    """Almacenamiento de los documentos personales (STORAGES['private_media'] en settings).

    Se pasa como funcion (storage=private_media_storage) para que las migraciones no
    dependan de la configuracion concreta de cada entorno."""
    return storages['private_media']
