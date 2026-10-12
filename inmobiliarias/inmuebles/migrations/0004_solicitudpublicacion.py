from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inmuebles', '0003_arrendar_modalidad_precioventa'),
    ]

    operations = [
        migrations.CreateModel(
            name='SolicitudPublicacion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=120)),
                ('telefono', models.CharField(max_length=30)),
                ('correo', models.EmailField(blank=True, max_length=254)),
                ('tipoInmueble', models.CharField(blank=True, max_length=100)),
                ('modalidad', models.CharField(choices=[('arriendo', 'En arriendo'), ('venta', 'En venta')], default='arriendo', max_length=10)),
                ('direccion', models.CharField(max_length=100)),
                ('barrio', models.CharField(blank=True, max_length=100)),
                ('ciudad', models.CharField(blank=True, max_length=50)),
                ('precio', models.IntegerField(blank=True, help_text='Canon mensual o precio de venta, segun la modalidad', null=True)),
                ('descripcion', models.TextField(blank=True)),
                ('foto', models.ImageField(blank=True, null=True, upload_to='media/publicaciones/')),
                ('estado', models.CharField(choices=[('pendiente', 'Pendiente'), ('contactado', 'Contactado'), ('descartada', 'Descartada')], default='pendiente', max_length=12)),
                ('notas', models.TextField(blank=True, help_text='Notas internas del equipo')),
                ('creada', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Solicitud para publicar una propiedad',
                'verbose_name_plural': 'Solicitudes para publicar una propiedad',
                'ordering': ['-creada'],
            },
        ),
    ]
