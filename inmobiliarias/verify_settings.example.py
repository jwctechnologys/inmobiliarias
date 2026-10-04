"""Configuracion SOLO para correr las pruebas en local, sin Postgres ni AWS.

Uso (una sola vez por equipo): copia este archivo a `verify_settings.py` en esta misma carpeta (junto a
manage.py). Esa copia esta en el .gitignore, asi que no se sube al repo.

    cp verify_settings.example.py verify_settings.py          # Git Bash / Linux / macOS
    copy verify_settings.example.py verify_settings.py        # CMD de Windows

Luego, desde esta carpeta (con el venv activado y `pip install -r requirements.txt` hecho):

    DJANGO_SETTINGS_MODULE=verify_settings DJANGO_SECRET_KEY=x USE_S3=0 python manage.py test

En PowerShell las variables se fijan antes: `$env:DJANGO_SETTINGS_MODULE="verify_settings"; $env:DJANGO_SECRET_KEY="x"; $env:USE_S3="0"`.

Como manage.py esta en esta carpeta, Python ya la ve: no hace falta tocar PYTHONPATH.
USE_S3=0 es obligatorio: sin el, los archivos subidos intentan ir a S3 y fallan por falta de credenciales.
"""
import os

from inmobiliarias.settings import *  # noqa: F401,F403  (hereda todo lo demas de la configuracion real)

SECRET_KEY = "verify-only-" + "x" * 50
DEBUG = False
ALLOWED_HOSTS = ["*"]
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.path.join(os.path.dirname(os.path.abspath(__file__)), os.environ.get("VERIFY_DB", "verify.sqlite3")),
    }
}
