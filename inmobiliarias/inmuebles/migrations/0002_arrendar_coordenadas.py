import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inmuebles', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='arrendar',
            name='coordenadas',
            field=models.CharField(
                blank=True,
                help_text='Latitud y longitud tal como las copia Google Maps (clic derecho sobre el punto). Ej: 4.1295747, -73.6220074',
                max_length=40,
                validators=[django.core.validators.RegexValidator(r'^\s*-?\d{1,2}(?:\.\d+)?\s*,\s*-?\d{1,3}(?:\.\d+)?\s*$', 'Escribe latitud y longitud separadas por coma, por ejemplo 4.1295747, -73.6220074')],
            ),
        ),
    ]
