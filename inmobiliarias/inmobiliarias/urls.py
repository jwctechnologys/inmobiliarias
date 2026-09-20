from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from arrendatarios import urls as arrendatarios_urls
from contratos import urls as contratos_urls
from inmuebles import urls as inmuebles_urls
from solicitudes import urls as solicitudes_urls
from usuarios import urls as usuarios_urls

# Cada app define sus rutas en su propio urls.py; aqui solo se juntan.
APPS_URLS = [usuarios_urls, arrendatarios_urls, inmuebles_urls, solicitudes_urls, contratos_urls]

# Un unico router para todos los ViewSet, asi la raiz de la API (/api/) los lista juntos.
router = DefaultRouter()
for app_urls in APPS_URLS:
    for route in app_urls.router_routes:
        router.register(*route)

urlpatterns = [path("admin/", admin.site.urls)]
for app_urls in APPS_URLS:
    urlpatterns += app_urls.urlpatterns

# El router va al final: rutas como api/solicitudes/verificar/ deben evaluarse antes.
urlpatterns.append(path('api/', include(router.urls)))

# Archivos estaticos y media (solo en DEBUG)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += staticfiles_urlpatterns()
