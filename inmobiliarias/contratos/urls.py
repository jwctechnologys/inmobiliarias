from django.urls import path

from . import views

urlpatterns = [
    # Contratos de vivienda
    path('api/contratos/activos/', views.ContratosActivosAPIView.as_view(), name='contratos-activos'),
    path('api/contratosActivosArrendatario/', views.ContratosActivosPorArrendatarioAPIView.as_view(), name='contratos-activos-arrendatario'),
    path('api/contratos-arrendatario/<int:arrendatario_id>/', views.ContratosArrendatarioView.as_view(), name='contratos_arrendatario'),
    path('api/contratos/<int:pk>/', views.DetalleContratoAPIView.as_view(), name='detalle-contrato'),
    path('api/contratos/<int:id>/update/', views.ContratoUpdateView.as_view(), name='contrato-update'),
    path('api/contratos/eliminar/<int:pk>/', views.EliminarContratoAPIView.as_view(), name='eliminar-contrato'),
    path('api/contratos/<int:contrato_id>/fecha-pago/', views.FechaPagoView.as_view(), name='fecha_pago'),

    # Subida de PDF
    path('api/upload-pdf/', views.PDFUploadView.as_view(), name='upload-pdf'),
    path('api/uploadContrato-pdf/', views.PDFUploadContratoView.as_view(), name='uploadContrato-pdf'),
    path('api/uploadContratoOtrosi-pdf/', views.PDFUploadOtrosiView.as_view(), name='uploadContrato-otrosi-pdf'),

    # Reportes y novedades
    path('api/reporte-pago-recibos/', views.ReportePagoRecibosView.as_view(), name='reporte_pago_recibos'),
    path('api/ver-pagos-servicios/<int:arrendatario_id>/', views.VerPagosServiciosView.as_view(), name='ver_pagos_servicios'),
    path('api/reportes-novedades/', views.ReporteNovedadesCreateView.as_view(), name='reportes-novedades-create'),
    path('api/verreportes-novedades/', views.ReporteNovedadesListView.as_view(), name='reportes-novedades'),
    path('api/enviar_reporte/<int:reporte_id>/', views.EnviarReporteView.as_view(), name='enviar_reporte'),

    # Inconformidades
    path('api/reporte-inconformidad/', views.ReporteInconformidadCreateView.as_view(), name='crear_reporte'),
    path('api/reporte-inconformidad/<int:pk>/', views.ReporteInconformidadCreateView.as_view(), name='actualizar_reporte'),
    path('api/contratos-inconformes/', views.ContratosInconformesView.as_view(), name='contratos-inconformes'),

    # Otrosi
    path('api/contratos-activos-otrosi/', views.ContratosActivosOtrosi.as_view(), name='contratos_activos_otrosi'),
    path('api/contratos_arrendatarios_otrosi/<int:arrendatario_id>/', views.ContratosArrendatariosOtrosi.as_view()),
    path('api/contra_arrendatarios_otrosi/<int:arrendatario_id>/', views.ContraArrendatariosOtrosi.as_view()),
    path('api/contra_arrendatarios_otrosi_firmado/<int:arrendatario_id>/', views.ContraArrendatariosOtrosiFirmados.as_view()),
]

router_routes = [
    (r'Contrato_Local_viviendaViewSet', views.ContratoViviendaViewSet, 'contrato-vivienda'),
    (r'otroSi', views.OtroSiViewSet, 'otroSi'),
]
