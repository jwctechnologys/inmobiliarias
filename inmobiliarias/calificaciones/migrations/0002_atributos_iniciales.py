from django.db import migrations

ATRIBUTOS = [
    ("responsable", "Responsable"),
    ("diligente", "Diligente"),
    ("acomedido", "Acomedido"),
    ("otro", "Otro"),
]


def crear_atributos(apps, schema_editor):
    AtributoProveedor = apps.get_model("calificaciones", "AtributoProveedor")
    for codigo, nombre in ATRIBUTOS:
        AtributoProveedor.objects.get_or_create(codigo=codigo, defaults={"nombre": nombre})


class Migration(migrations.Migration):

    dependencies = [
        ("calificaciones", "0001_initial"),
    ]

    operations = [
        # Sin reversa de datos: borrar las cualidades tambien borraria calificaciones ya hechas.
        migrations.RunPython(crear_atributos, migrations.RunPython.noop),
    ]
