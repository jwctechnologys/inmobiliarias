from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inmuebles', '0002_arrendar_coordenadas'),
    ]

    operations = [
        migrations.AddField(
            model_name='arrendar',
            name='modalidad',
            field=models.CharField(choices=[('arriendo', 'En arriendo'), ('venta', 'En venta')], default='arriendo', max_length=10),
        ),
        migrations.AddField(
            model_name='arrendar',
            name='precioVenta',
            field=models.IntegerField(blank=True, help_text='Solo si se ofrece en venta', null=True),
        ),
        migrations.AlterField(
            model_name='arrendar',
            name='canonmensual',
            field=models.IntegerField(default=0),
        ),
    ]
