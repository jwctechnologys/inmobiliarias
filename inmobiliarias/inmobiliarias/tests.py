from unittest import skipUnless

from django.apps import apps
from django.conf import settings
from django.core.files.storage import default_storage, storages
from django.db.models import FileField
from django.test import SimpleTestCase


def campos_de_archivo(app_label):
    for model in apps.get_app_config(app_label).get_models():
        for campo in model._meta.get_fields():
            if isinstance(campo, FileField):
                yield f"{app_label}.{model.__name__}.{campo.name}", campo


class AlmacenamientoDeArchivosTests(SimpleTestCase):
    """Fotos y videos de las casas son publicos; todo lo demas (documentos) es privado."""

    def test_documentos_van_al_almacenamiento_privado(self):
        campos = [c for app in ("solicitudes", "contratos") for c in campos_de_archivo(app)]
        self.assertGreater(len(campos), 0)
        for nombre, campo in campos:
            self.assertIs(campo.storage, storages["private_media"], nombre)

    def test_fotos_y_videos_de_casas_van_al_almacenamiento_publico(self):
        campos = list(campos_de_archivo("inmuebles"))
        self.assertGreater(len(campos), 0)
        for nombre, campo in campos:
            self.assertIs(campo.storage, default_storage, nombre)

    def test_no_hay_claves_de_aws_en_la_configuracion(self):
        # En EC2 las credenciales vienen del rol de IAM, nunca del codigo.
        self.assertFalse(hasattr(settings, "AWS_ACCESS_KEY_ID") and settings.AWS_ACCESS_KEY_ID)
        self.assertFalse(hasattr(settings, "AWS_SECRET_ACCESS_KEY") and settings.AWS_SECRET_ACCESS_KEY)

    @skipUnless(settings.USE_S3, "solo aplica con USE_S3=1")
    def test_configuracion_de_s3(self):
        publico, privado = storages["default"], storages["private_media"]
        self.assertEqual((publico.location, publico.querystring_auth), ("publico", False))
        self.assertEqual((privado.location, privado.querystring_auth), ("privado", True))
        for s in (publico, privado):
            self.assertIsNone(s.default_acl)      # el acceso lo decide la politica del bucket
            self.assertFalse(s.file_overwrite)    # no se pisan archivos con el mismo nombre
