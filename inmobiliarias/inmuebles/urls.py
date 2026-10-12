from django.urls import path

from . import gestion, publico, views

urlpatterns = [
    path('api/inmuebles/', views.listar_inmuebles, name='listar_inmuebles'),
    path('api/crear_casa/', views.CasaCreateView.as_view(), name='crear_casa'),
    path('api/publicar_propiedad/', views.SolicitudPublicacionCreateView.as_view(), name='publicar_propiedad'),
    # API publica (solo lectura, sin datos privados)
    path('api/publico/inmuebles/', publico.InmueblesPublicosView.as_view(), name='publico_inmuebles'),
    path('api/publico/inmuebles/<int:pk>/', publico.InmueblePublicoDetalleView.as_view(), name='publico_inmueble'),
    path('api/publico/inmuebles/<int:pk>/consulta/', publico.ConsultaInmuebleView.as_view(), name='publico_consulta'),
    path('api/publico/mapa/', publico.MapaPublicoView.as_view(), name='publico_mapa'),
    path('api/publico/filtros/', publico.FiltrosPublicosView.as_view(), name='publico_filtros'),
    path('api/compartir/<int:pk>/', publico.compartir, name='compartir_inmueble'),
    # Gestion (administradores y propietarios)
    path('api/gestion/publicaciones/', gestion.PublicacionesView.as_view(), name='gestion_publicaciones'),
    path('api/gestion/publicaciones/<int:pk>/', gestion.PublicacionDetalleView.as_view(), name='gestion_publicacion'),
    path('api/gestion/consultas/', gestion.ConsultasView.as_view(), name='gestion_consultas'),
    path('api/gestion/consultas/<int:pk>/', gestion.ConsultaDetalleView.as_view(), name='gestion_consulta'),
    path('api/gestion/mis-inmuebles/', gestion.MisInmueblesView.as_view(), name='gestion_mis_inmuebles'),
]

router_routes = [
    (r'InmuebleViewSet', views.InmuebleViewSet),
    (r'casas', views.CasaViewSet, 'casa'),
    (r'imagenes', views.ImagenCasaArrendarViewSet, 'imagenes'),
    (r'videos', views.VideoCasaViewSet, 'videos'),
]
