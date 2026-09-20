from django.urls import path

from . import views

urlpatterns = [
    path('api/aplicar/<int:casa_id>/', views.aplicar_a_casa, name='aplicar_a_casa'),
    path('api/solicitudes-pendientes/', views.contar_solicitudes_pendientes, name='solicitudes-pendientes'),
    path('api/obtener-pendientes/', views.obtener_solicitudes_pendientes, name='obtener_pendientes'),
    path('api/obtener-aceptadas/', views.obtener_solicitudes_aceptadas, name='solicitudes-aceptadas'),
    path('api/aceptar-solicitud/<int:solicitud_id>/', views.aceptar_solicitud, name='aceptar-solicitud'),
    path('api/rechazar-solicitud/<int:solicitud_id>/', views.rechazar_solicitud, name='rechazar-solicitud'),

    path('api/mis-solicitudes/', views.obtener_mis_solicitudes, name='mis_solicitudes'),
    path('api/solicitud-publica/<int:solicitud_id>/', views.obtener_solicitud_publica, name='obtener_solicitud_publica'),
    path('api/solicitud-completa/', views.solicitud_completa, name='solicitud_completa'),
    path('api/solicitudes/verificar/', views.verificar_solicitud, name='verificar_solicitud'),
    path('api/solicitudes/aceptadas/no-atendidas/', views.solicitudes_aceptadas_no_atendidas, name='solicitudes-aceptadas-no-atendidas'),
    path('api/solicitudes/arrendatario/<int:arrendatario_id>/pendientes/',
         views.obtener_solicitudes_pendientes_arrendatario,
         name='solicitudes-pendientes-arrendatario'),
]

router_routes = [
    (r'solicitudes', views.SolicitudViewSet),
]
