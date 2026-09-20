from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from inicio.views import *
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth.views import LogoutView
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from usuarios.views import *


router = DefaultRouter()

# ============================================================
# NUEVO: Router para Contrato de Vivienda (sin FK)
# ============================================================
router.register(r'Contrato_Local_viviendaViewSet', ContratoViviendaViewSet, basename='contrato-vivienda')

# Otros routers existentes
router.register(r'AdministradorViewSet', AdministradorViewSet)
router.register(r'ArrendatarioViewSet', ArrendatarioViewSet)
router.register(r'InmuebleViewSet', InmuebleViewSet)
router.register(r'otroSi', OtroSiViewSet, basename='otroSi')
router.register(r'casas', CasaViewSet, basename='casa')
router.register(r'imagenes', ImagenCasaArrendarViewSet, basename='imagenes')
router.register(r'videos', VideoCasaViewSet, basename='videos')
router.register(r'solicitudes', SolicitudViewSet)


urlpatterns = [
    path("admin/", admin.site.urls),
    
    # ============================================================
    # CSRF
    # ============================================================
    path('api/csrf/', get_csrf_token, name='get_csrf_token'),
    
    # ============================================================
    # USUARIOS Y AUTENTICACIÓN
    # ============================================================
    path('api/create/', user_create_view, name='user_create'),
    path('api/completar-perfil/', completar_perfil_view, name='completar_perfil'),
    path('api/login/', login_view),
    path('api/logout/', logout_view),
    path('api/user_profile_update/', user_profile_update_view, name='user_profile_update'),
    
    path('api/usuarios_por_grupo/<str:grupo_nombre>/', listar_usuarios_por_grupo, name='listar_usuarios_por_grupo'),
    path('api/usuarios_por_grupo/<str:grupo_nombre>/<int:id>/', listar_usuarios_por_grupo, name='listar_usuarios_por_grupo'),
    
    # ============================================================
    # INMUEBLES
    # ============================================================
    path('api/inmuebles/', listar_inmuebles, name='listar_inmuebles'),
    path('api/crear_casa/', CasaCreateView.as_view(), name='crear_casa'),
    
    # ============================================================
    # CONTRATOS DE VIVIENDA (NUEVOS ENDPOINTS)
    # ============================================================
    # Listar contratos activos
    path('api/contratos/activos/', ContratosActivosAPIView.as_view(), name='contratos-activos'),
    
    # Listar contratos activos por arrendatario
    path('api/contratosActivosArrendatario/', ContratosActivosPorArrendatarioAPIView.as_view(), name='contratos-activos-arrendatario'),
    
    # Contratos por arrendatario
    path('api/contratos-arrendatario/<int:arrendatario_id>/', ContratosArrendatarioView.as_view(), name='contratos_arrendatario'),
    
    # Detalle de contrato
    path('api/contratos/<int:pk>/', DetalleContratoAPIView.as_view(), name='detalle-contrato'),
    
    # Actualizar contrato
    path('api/contratos/<int:id>/update/', ContratoUpdateView.as_view(), name='contrato-update'),
    
    # Eliminar contrato
    path('api/contratos/eliminar/<int:pk>/', EliminarContratoAPIView.as_view(), name='eliminar-contrato'),
    
    # Fechas de pago
    path('api/contratos/<int:contrato_id>/fecha-pago/', FechaPagoView.as_view(), name='fecha_pago'),
    
    # ============================================================
    # SUBIR PDFs
    # ============================================================
    path('api/upload-pdf/', PDFUploadView.as_view(), name='upload-pdf'),
    path('api/uploadContrato-pdf/', PDFUploadContratoView.as_view(), name='uploadContrato-pdf'),
    path('api/uploadContratoOtrosi-pdf/', PDFUploadOtrosiView.as_view(), name='uploadContrato-otrosi-pdf'),
    
    # ============================================================
    # COARRENDATARIOS, DEPENDIENTES Y REFERENCIAS
    # ============================================================
    path('api/coarrendatarios/create/', create_coarrendatario, name='create_coarrendatario'),
    path('api/coarrendatario/', listar_coarrendatarios, name='listar_coarrendatarios'),
    path('api/coarrendatarios/<int:pk>/', update_coarrendatario, name='update_coarrendatario'),
    
    path('api/dependientes/create/', create_dependientes, name='create_dependientes'),
    path('api/dependientes/', listar_dependientes, name='listar_dependientes'),
    path('api/dependiente/<int:pk>/', update_dependiente, name='update_dependiente'),
    path('api/dependientes/<int:arrendatario_id>/', get_dependientes_por_arrendatario, name="get_dependientes"),
    
    path('api/referencias/create/', create_referencias, name='create_referencias'),
    path('api/referencias/', listar_referencias, name='listar_referencias'),
    path('api/referencias/<int:pk>/', update_referencias, name='update_referencias'),
    
    # ============================================================
    # ARRENDATARIOS
    # ============================================================
    path('api/arrendatarios/', listar_arrendatarios, name='listar_arrendatarios'),
    
    # ============================================================
    # REPORTES Y NOVEDADES
    # ============================================================
    path("api/reporte-pago-recibos/", ReportePagoRecibosView.as_view(), name="reporte_pago_recibos"),
    path('api/ver-pagos-servicios/<int:arrendatario_id>/', VerPagosServiciosView.as_view(), name='ver_pagos_servicios'),
    
    path('api/reportes-novedades/', ReporteNovedadesCreateView.as_view(), name='reportes-novedades-create'),
    path('api/verreportes-novedades/', ReporteNovedadesListView.as_view(), name='reportes-novedades'),
    path('api/enviar_reporte/<int:reporte_id>/', EnviarReporteView.as_view(), name='enviar_reporte'),
    
    # ============================================================
    # INCONFORMIDADES
    # ============================================================
    path('api/reporte-inconformidad/', ReporteInconformidadCreateView.as_view(), name='crear_reporte'),
    path('api/reporte-inconformidad/<int:pk>/', ReporteInconformidadCreateView.as_view(), name='actualizar_reporte'),
    path('api/contratos-inconformes/', ContratosInconformesView.as_view(), name='contratos-inconformes'),
    
    # ============================================================
    # OTROSÍ
    # ============================================================
    path('api/contratos-activos-otrosi/', ContratosActivosOtrosi.as_view(), name='contratos_activos_otrosi'),
    path('api/contratos_arrendatarios_otrosi/<int:arrendatario_id>/', ContratosArrendatariosOtrosi.as_view()),
    path('api/contra_arrendatarios_otrosi/<int:arrendatario_id>/', ContraArrendatariosOtrosi.as_view()),
    path('api/contra_arrendatarios_otrosi_firmado/<int:arrendatario_id>/', ContraArrendatariosOtrosiFirmados.as_view()),
    
    # ============================================================
    # SOLICITUDES
    # ============================================================
    path('api/aplicar/<int:casa_id>/', aplicar_a_casa, name='aplicar_a_casa'),
    path('api/solicitudes-pendientes/', contar_solicitudes_pendientes, name='solicitudes-pendientes'),
    path('api/obtener-pendientes/', obtener_solicitudes_pendientes, name='obtener_pendientes'),
    path('api/obtener-aceptadas/', obtener_solicitudes_aceptadas, name='solicitudes-aceptadas'),
    path('api/aceptar-solicitud/<int:solicitud_id>/', aceptar_solicitud, name='aceptar-solicitud'),
    path('api/rechazar-solicitud/<int:solicitud_id>/', rechazar_solicitud, name='rechazar-solicitud'),
    
    path('api/mis-solicitudes/', obtener_mis_solicitudes, name='mis_solicitudes'),
    path('api/solicitud-publica/<int:solicitud_id>/', obtener_solicitud_publica, name='obtener_solicitud_publica'),
    path('api/solicitud-completa/', solicitud_completa, name='solicitud_completa'),
    path('api/solicitudes/verificar/', verificar_solicitud, name='verificar_solicitud'),
    path('api/solicitudes/aceptadas/no-atendidas/', solicitudes_aceptadas_no_atendidas, name='solicitudes-aceptadas-no-atendidas'),
    path('api/solicitudes/arrendatario/<int:arrendatario_id>/pendientes/', 
         obtener_solicitudes_pendientes_arrendatario, 
         name='solicitudes-pendientes-arrendatario'),
    
    # ============================================================
    # ROUTER
    # ============================================================
    path('api/', include(router.urls)),
]

# ============================================================
# ARCHIVOS ESTÁTICOS Y MEDIA (SOLO EN DEBUG)
# ============================================================
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += staticfiles_urlpatterns()