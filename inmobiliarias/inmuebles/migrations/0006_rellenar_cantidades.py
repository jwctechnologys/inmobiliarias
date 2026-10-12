import re

from django.db import migrations

from inmuebles.utilidades import parsear_coordenadas

# Hasta ahora las cantidades se escribian en las observaciones ("3", "2 con closet"): se pasan al campo numerico
# para que se pueda buscar y filtrar. Solo se rellena lo que esta vacio y siempre que el espacio exista.
_CAMPOS = [
    ('habitaciones', 'observacion_habitaciones', 'num_habitaciones'),
    ('baños', 'observacion_baños', 'num_banos'),
    ('garage', 'observacion_garage', 'num_parqueaderos'),
]


def rellenar(apps, schema_editor):
    Arrendar = apps.get_model('inmuebles', 'arrendar')
    # La portada ahora respeta el campo "publicar". Hasta hoy mostraba todo lo que no tuviera solicitud aceptada:
    # se marcan como publicadas esas mismas casas para que ninguna desaparezca de la portada al desplegar.
    Arrendar.objects.filter(solicitudAceptada=False).update(publicar=True)
    for casa in Arrendar.objects.all():
        cambios = []
        for existe, observacion, destino in _CAMPOS:
            if not getattr(casa, existe) or getattr(casa, destino) is not None:
                continue
            m = re.match(r'\s*(\d{1,2})\b', getattr(casa, observacion) or '')
            if m:
                setattr(casa, destino, int(m.group(1)))
                cambios.append(destino)
        punto = parsear_coordenadas(casa.coordenadas)
        if punto:
            casa.latitud, casa.longitud = punto
            cambios += ['latitud', 'longitud']
        if cambios:
            casa.save(update_fields=cambios)


class Migration(migrations.Migration):

    dependencies = [
        ('inmuebles', '0005_datos_de_busqueda'),
    ]

    operations = [
        migrations.RunPython(rellenar, migrations.RunPython.noop),
    ]
