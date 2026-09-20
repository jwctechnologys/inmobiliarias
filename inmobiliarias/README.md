# Backend (Django + DRF)

API de la inmobiliaria. El frontend (React/Vite) vive en `../inmobiliaria-vite`.

## Estructura

Cada app tiene una sola responsabilidad y **solo depende de las anteriores**:

```
usuarios/        User + perfiles de rol (administrador, propietario, arrendatario, proveedor),
                 login/registro/perfil. AUTH_USER_MODEL. signals.py crea los grupos y los perfiles.
arrendatarios/   ficha del arrendatario: declaracion de ingresos, coarrendatarios, dependientes, referencias
inmuebles/       casas para arrendar, fotos y videos
solicitudes/     solicitud de arriendo sobre un inmueble (aplicar, aceptar, rechazar, formulario completo)
contratos/       contratos de vivienda, otrosi, fechas de pago, novedades, inconformidades
calificaciones/  calificaciones de arrendatarios y de proveedores (referencias para futuros arriendos)
```

Dentro de cada app: `models.py`, `serializers.py`, `views.py` (o `views/` con un modulo por tema),
`urls.py` y `admin.py`. El `urls.py` del proyecto solo junta las rutas de cada app; los ViewSet se
registran en un unico router para que `/api/` los liste juntos.

Convenciones:
- Sin `import *`: cada archivo importa explicitamente lo que usa.
- Tipos de documento y genero: `usuarios/choices.py` (no se repiten las listas en cada modelo).
- Secretos y configuracion sensible solo por variables de entorno (ver `.env.example`).

## Base de datos nueva (tras la reestructuracion)

Las migraciones se regeneraron desde cero (una `0001_initial` por app). No son compatibles con una
base creada antes de esta version, asi que se levanta una **base nueva**:

1. En RDS, crear una base vacia (p. ej. `inmobiliarias_v2`). La anterior se puede conservar hasta confirmar.
2. Apuntar `DB_NAME` a la nueva en el archivo de entorno del servidor.
3. Con el `venv` activado:
   ```bash
   pip install -r requirements.txt
   python manage.py migrate            # crea tablas, los 4 grupos de roles y las cualidades de proveedor
   python manage.py createsuperuser
   python manage.py collectstatic --noinput
   ```
4. Reiniciar gunicorn.

Al desplegar, **reemplazar** las carpetas de las apps (no copiar encima): `inicio/` ya no existe
(ahora es `inmuebles/`) y `usuarios/views.py` paso a ser la carpeta `usuarios/views/`.

## Verificacion usada en la reestructuracion

- `manage.py check` y `makemigrations --check` sin cambios.
- `migrate` desde cero sobre una base vacia (SQLite) y `manage.py test`.
- Comparacion de las rutas de la API antes/despues (95 rutas identicas: ruta, nombre y vista).
- 130 peticiones (GET y POST vacio) contra el codigo anterior y el nuevo: mismas respuestas.
