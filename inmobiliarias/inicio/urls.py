from rest_framework import routers
from inicio.api.vistas.api import inicioViewSet
from inicio.api.vistas.viewsarrendar import arriendoViewSet

router = routers.DefaultRouter()

router.register('api/inicio', inicioViewSet, 'inicio')
router.register('api/arriendo', arriendoViewSet, 'arriendo')
urlpatterns = router.urls

