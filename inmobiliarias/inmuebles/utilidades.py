"""Utilidades de los inmuebles: coordenadas, fotos y enlaces legibles."""
import re
import unicodedata
from io import BytesIO

from django.core.files.base import ContentFile
from PIL import Image, ImageOps

_RE_COORDENADAS = re.compile(r"^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$")

LADO_MAXIMO = 1600  # px: de sobra para pantallas grandes y mucho mas liviano que una foto de celular (4000 px)
CALIDAD_JPEG = 82


def parsear_coordenadas(texto):
    """"4.1295747, -73.6220074" (lo que copia Google Maps) -> (latitud, longitud), o None si no es valido."""
    m = _RE_COORDENADAS.match(texto or "")
    if not m:
        return None
    lat, lng = float(m.group(1)), float(m.group(2))
    return (lat, lng) if -90 <= lat <= 90 and -180 <= lng <= 180 else None


def comprimir_imagen(campo):
    """Reduce una foto recien subida (lado mayor <= LADO_MAXIMO, JPEG calidad 82, orientacion corregida).

    `campo` es el ImageField del modelo. Solo actua sobre archivos nuevos (aun sin guardar) y nunca falla: si la
    imagen no se puede procesar se deja tal cual para no perder la subida.
    """
    if not campo or getattr(campo, "_committed", True):
        return
    try:
        campo.file.seek(0)
        imagen = ImageOps.exif_transpose(Image.open(campo.file))
        if imagen.mode in ("RGBA", "LA", "P"):
            fondo = Image.new("RGB", imagen.size, (255, 255, 255))
            fondo.paste(imagen.convert("RGBA"), mask=imagen.convert("RGBA").split()[-1])
            imagen = fondo
        else:
            imagen = imagen.convert("RGB")
        imagen.thumbnail((LADO_MAXIMO, LADO_MAXIMO), Image.LANCZOS)
        salida = BytesIO()
        imagen.save(salida, format="JPEG", quality=CALIDAD_JPEG, optimize=True, progressive=True)
        nombre = re.sub(r"\.[A-Za-z0-9]+$", "", campo.name.rsplit("/", 1)[-1]) + ".jpg"
        campo.save(nombre, ContentFile(salida.getvalue()), save=False)
    except Exception:  # noqa: BLE001 - una foto rara no debe tumbar el registro del inmueble
        return


def slug_de(texto):
    """"Apartamento en Ciudad Salitre" -> "apartamento-en-ciudad-salitre" (sin tildes ni simbolos)."""
    limpio = unicodedata.normalize("NFKD", texto or "").encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", limpio.lower()).strip("-")
