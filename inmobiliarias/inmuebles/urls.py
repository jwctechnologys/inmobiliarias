from django.urls import path

from . import views

urlpatterns = [
    path('api/inmuebles/', views.listar_inmuebles, name='listar_inmuebles'),
    path('api/crear_casa/', views.CasaCreateView.as_view(), name='crear_casa'),
]

router_routes = [
    (r'InmuebleViewSet', views.InmuebleViewSet),
    (r'casas', views.CasaViewSet, 'casa'),
    (r'imagenes', views.ImagenCasaArrendarViewSet, 'imagenes'),
    (r'videos', views.VideoCasaViewSet, 'videos'),
]
