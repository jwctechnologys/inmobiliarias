"""Vistas de solicitudes, agrupadas por tema."""

from .consultas import obtener_mis_solicitudes, obtener_solicitud_publica
from .formulario import solicitud_completa
from .gestion import (
    SolicitudListView,
    SolicitudViewSet,
    aceptar_solicitud,
    aplicar_a_casa,
    contar_solicitudes_pendientes,
    obtener_solicitudes_aceptadas,
    obtener_solicitudes_pendientes,
    obtener_solicitudes_pendientes_arrendatario,
    rechazar_solicitud,
    solicitudes_aceptadas_no_atendidas,
    verificar_solicitud,
)

__all__ = ["aplicar_a_casa", "contar_solicitudes_pendientes", "obtener_solicitudes_pendientes", "aceptar_solicitud", "rechazar_solicitud", "obtener_solicitudes_aceptadas", "solicitudes_aceptadas_no_atendidas", "obtener_solicitudes_pendientes_arrendatario", "verificar_solicitud", "SolicitudListView", "SolicitudViewSet", "solicitud_completa", "obtener_mis_solicitudes", "obtener_solicitud_publica"]
