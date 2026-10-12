"""Avisos por correo al equipo cuando llega algo nuevo desde el portal."""
import logging

from django.conf import settings
from django.core.mail import send_mail

log = logging.getLogger(__name__)


def avisar_al_equipo(asunto, cuerpo):
    """Envia un correo a NOTIFICAR_A. Nunca lanza error: si el correo falla, la solicitud ya quedo guardada."""
    if not settings.NOTIFICAR_A:
        return
    try:
        send_mail(f"[Inmobiliaria CL] {asunto}", cuerpo, settings.DEFAULT_FROM_EMAIL, settings.NOTIFICAR_A, fail_silently=False)
    except Exception:  # noqa: BLE001
        log.exception("No se pudo enviar el aviso por correo: %s", asunto)
