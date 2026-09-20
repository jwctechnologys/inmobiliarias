from pathlib import Path
from dotenv import load_dotenv
import os
from django.contrib.messages import constants as messages

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "django_filters",
    "rest_framework",
    "storages",

]

EXTERNAL_APPS =[
    
    "usuarios",
    "inicio",
    "contratos",

    
]

INSTALLED_APPS += EXTERNAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
  
]

ROOT_URLCONF = "inmobiliarias.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "inmobiliarias.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')  # None en EC2 con rol de IAM: boto3 usa el rol
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME_INMOBILIARIA', 'inmobiliaria-media')
AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'us-east-2')
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_DEFAULT_ACL = 'public-read'
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',
}

# Configuración de almacenamiento para medios
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
AWS_LOCATION = 'inmobiliaria'


DATABASES = {
    "default": {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

STATIC_ROOT = BASE_DIR / 'staticfiles'
STATIC_URL = '/inmobiliarias/static/'
MEDIA_ROOT = BASE_DIR  /"media"

AUTH_USER_MODEL = 'usuarios.User'
# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/
# Configuración CSRF

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators
CORS_ALLOW_ALL_ORIGINS = False  # nunca True junto con CORS_ALLOW_CREDENTIALS
CORS_ALLOW_CREDENTIALS = True

#MEDIA_URL = '/inmobiliarias/media/'

CSRF_TRUSTED_ORIGINS = [
    "https://d2xzv6q1daxyi1.cloudfront.net",
    "https://qmanda360.com",
    "http://localhost:5173",
]

CORS_ALLOWED_ORIGINS = [
    "https://d2xzv6q1daxyi1.cloudfront.net",
    "https://qmanda360.com",
    "http://localhost:5173",
    
]

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


FORCE_SCRIPT_NAME = '/inmobiliarias'
# Además, desactiva la verificación estricta de referer:
#CSRF_USE_SESSIONS = False   # por defecto ya es False
#CSRF_COOKIE_HTTPONLY = False # permite leer la cookie desde JS

CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True

CSRF_COOKIE_PATH = '/inmobiliarias'
CSRF_COOKIE_NAME = 'inmobiliarias_csrftoken'


SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = 3600  # subir a 31536000 (1 año) cuando confirmes que todo va bien por HTTPS


LOGIN_REDIRECT_URL = 'home'  # Redirige después del inicio de sesión
LOGOUT_REDIRECT_URL = 'home'  # Redirige después del cierre de sesión
# settings.py
DATA_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50 MB (en bytes)
FILE_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50 MB (en bytes)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',  # en DEBUG las librerías (boto3, etc.) loguean detalles de más
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'django.security.csrf': {  # <--- Logger específico para CSRF
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
