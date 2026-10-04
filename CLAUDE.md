# Inmobiliaria CL — guía para Claude

Monorepo de una app de gestión inmobiliaria (contratos de arrendamiento, solicitudes, novedades, pagos).
Repo: `jwctechnologys/inmobiliarias`. Producción: `https://qmanda360.com/inmobiliarias` (API) y CloudFront
`d2xzv6q1daxyi1.cloudfront.net` (frontend).

## Cómo trabajar con el usuario
- **Responde en español** (el usuario no lee bien inglés). Comentarios, mensajes de commit y nombres de ramas también en español, como el resto del código.
- Flujo habitual: el usuario reporta un bug o pide una mejora → diagnosticas la causa raíz → arreglas + escribes pruebas → creas rama, commit y push → le das el **enlace para abrir el PR** → el usuario hace el merge a mano y reporta el siguiente tema.
- **No hay `gh` CLI.** Tras `git push`, GitHub imprime la URL `https://github.com/jwctechnologys/inmobiliarias/pull/new/<rama>`; esa es la que se entrega.
- Antes de crear la rama: `git fetch origin` y partir de `origin/main` (`git switch -c <rama> origin/main`). Si hay cambios sin commitear de otra rama, `git stash push -u -- <archivos>`, cambiar de rama y `git stash pop`. Hacer `git add` solo de los archivos del cambio (hay una carpeta `.claude/` local sin trackear: no se sube).
- Termina los commits con `Co-Authored-By: Claude <noreply@anthropic.com>` (usa el modelo que figure en el recordatorio de atribución de la sesión).
- Cuando encuentres un bug, **audita toda la categoría** (p. ej. todos los `fetch` sin `credentials`), no solo la instancia reportada, y demuestra el bug antes de arreglarlo.
- Si un cambio tuyo introduce una regresión, díselo al usuario con claridad.

## Estructura
```
inmobiliarias/            Backend Django 6 + DRF (manage.py aquí)
  inmobiliarias/          settings.py, urls.py, vacios.py, storage.py
  usuarios/ arrendatarios/ inmuebles/ solicitudes/ contratos/ calificaciones/
  deploy/                 deploy.sh, salud.sh, PRIMER_DESPLIEGUE.md
inmobiliaria-vite/        Frontend Vite + React 18 + Tailwind 4
  src/config.js           API_URL (única fuente; viene de VITE_BASE_URL)
  src/routes/             rutas.js (array {path, Pagina, protegida}, con React.lazy)
  src/features/           auth, casas, contratos, inicio, novedades, pagos, solicitudes, usuarios
  src/utils/              fechas.js, errores.js, csrf.js, formStyles.js
  src/tests/              vitest + testing-library
.github/workflows/        deploy-backend.yml, deploy-frontend.yml
```
Hay un proyecto hermano, `Restaurante` (`C:\Users\willi\GitHub\Restaurante`), que comparte la misma EC2 y toma a `inmobiliaria-vite` como referencia estructural.

## Comandos
Frontend (`inmobiliaria-vite/`):
```bash
npm run dev        # desarrollo
npm run build      # compilar (también sirve para detectar errores de sintaxis)
npx vitest run     # pruebas
npm run lint
npm run preview -- --port 4173   # probar el build real (sin StrictMode); el .claude/launch.json local no está en el repo
```
Backend (`inmobiliarias/`), pruebas locales:
```bash
DJANGO_SETTINGS_MODULE=verify_settings DJANGO_SECRET_KEY=x USE_S3=0 python manage.py test
```
- `USE_S3=0` es obligatorio en local (si no, `botocore` falla por falta de credenciales AWS).
- `verify_settings.py` **no está en el repo**: es un archivo local (SQLite en memoria, `DEBUG=False`, `ALLOWED_HOSTS=["*"]`) que hereda de `inmobiliarias.settings`. Si no existe, créalo en un directorio fuera del repo y ponlo en `PYTHONPATH`. En la sesión anterior vivía en el scratchpad junto con un venv (`venv6`, Django 6.0.3, igual que `requirements.txt`).
- **Windows:** `PYTHONPATH` debe usar rutas estilo `C:/Users/...`, **no** `/c/Users/...` (Python las convierte mal en `C:\c\Users\...`).
- CI (`deploy-backend.yml`) corre `manage.py check`, `makemigrations --check --dry-run` (modelos y migraciones deben coincidir) y `manage.py test` contra Postgres 16. En PR solo prueba; en push a `main` prueba y despliega.

## Arquitectura y datos: lo que no es obvio
- **`contrato_local_vivienda` (contratos/models.py) es el modelo ÚNICO de todos los contratos** (vivienda, comercial, local-vivienda; los distingue `tipoContrato`). Guarda una **copia inmutable** de arrendador, arrendatario, coarrendatario, inmueble y cláusulas (`arrendador_*`, `arrendatario_*`, `inmueble_*`, `clausulas_copia`...). Esto es deliberado: un contrato impreso **no debe cambiar** si luego se editan los perfiles. Las referencias a los originales son solo auditoría (`arrendatario_id_original`, `inmueble_id_original`...), enteros sin FK.
- **El `id` que usa el frontend (`localStorage.user.id`) es el id del PERFIL** (`arrendatario`, `administrador`, `propietario`, `proveedor`), no el del `User`; el del `User` viene como `user_id`. `arrendatario_id_original` es el id del perfil de arrendatario. Desde un `User` se llega al perfil con `request.user.arrendatario` (related_name).
- `User.email` es **único**: en pruebas pasa siempre un email distinto por usuario.
- `administrador` y `propietario` tienen campos bancarios (`cuentaDaviplata`, `cuentaNequi`, `CuentaBancolombia`, `llave` = Llave Bre-B). Los endpoints de actualización usan una lista blanca `allowed_fields` (`usuarios/views/perfiles.py`): un campo nuevo se **ignora en silencio** si no se agrega ahí.
- `reporteNovedades` (+ imágenes, videos, **audios**) cuelga de un contrato. `POST /api/reportes-novedades/` exige sesión **y** que el contrato sea del arrendatario autenticado (403 si no).
- `FORCE_SCRIPT_NAME = '/inmobiliarias'`: en las pruebas las URLs reales llevan ese prefijo (los logs muestran `/inmobiliarias/api/...`) pero el test client usa `/api/...`.
- Archivos subidos: `private_media_storage` (S3 en producción, disco con `USE_S3=0`).

## Reglas de código (aprendidas a golpes)
**Backend**
- Los formularios web mandan `""` en campos vacíos. Usa `inmobiliarias/vacios.py` (`vacios_a_none`, `VaciosANoneMixin`) para convertirlos a `None` en campos numéricos/fecha/relación opcionales.
- **Nunca `dict(request.data)`**: con multipart `request.data` es un `QueryDict` y `dict(qd)` convierte cada valor en una lista de uno. Usa `data.copy()`. (Rompió todos los envíos multipart una vez.)
- **No pongas emoji en `print()`**: en consolas Windows cp1252 lanzan `UnicodeEncodeError`; si el `print` está dentro de un `except`, además enmascara el error real y la petición termina en 500. Quedan emoji sin corregir en `solicitudes/views/formulario.py`, `contratos/views/contratos.py` y `usuarios/views/auth.py` (hacen fallar 2 pruebas de `solicitudes` en Windows; en Linux/CI no).
- Vistas que cambian datos: agrega `permission_classes` y valida la propiedad del recurso en el servidor (el filtrado del frontend no es seguridad). Sin `REST_FRAMEWORK` configurado, DRF usa `AllowAny` por defecto.
- Migraciones: aditivas y compatibles con la versión anterior (el despliegue no las revierte).
- Cada arreglo lleva su prueba de regresión en el `tests.py` de la app; verifica que falle sin el arreglo.

**Frontend**
- **Todo `fetch` a un endpoint con `IsAuthenticated` necesita `credentials: 'include'`.** Sin eso responde 403 con un objeto de error, y un `.map()` posterior revienta (`i.map is not a function`). Valida con `Array.isArray(data)` antes de `.map/.filter`.
- **Tailwind lee el código como texto**: escribe las clases **completas** (`from-purple-50`); nunca las armes por fragmentos (`` `from-${color}` ``) porque no se generan. Ver `src/utils/formStyles.js`.
- Estilos de formulario compartidos: `estilosFormulario('azul'|'verde'|'indigo'|'purpura')` en `src/utils/formStyles.js`. Los formularios de registro y `NuevoContrato*` ya tienen su propio estilo Tailwind consistente.
- La URL de la API siempre vía `import { API_URL } from '.../config'`. Nada de secretos en variables `VITE_*`.
- Dev en Windows, CI en Ubuntu: cuida las **mayúsculas/minúsculas en los imports** (NTFS no distingue; Linux sí y el build de CI falla).
- Imprimir contratos: los elementos con clase `no-print` se ocultan al imprimir (regla global en `styles/index.css`).
- Duración de contrato = meses enteros entre inicio y fin (`utils/fechas.js → mesesEnteros`), campo de solo lectura.
- `NavBar.jsx` mide los ítems con un contenedor oculto y un `ResizeObserver`; el efecto depende de `loading`. No volver a estimar anchos por número de caracteres.

## Despliegue (resumen)
- Push a `main` → GitHub Actions. Autentica con **OIDC** (rol `github-deploy-inmobiliarias`), sin claves guardadas.
- Frontend: `npm ci && npm run build` → S3 (`qmanda360camila360`) → invalida CloudFront. Detalles en `inmobiliaria-vite/DEPLOY.md`.
- Backend: `aws ssm send-command` ejecuta `inmobiliarias/deploy/deploy.sh` en la EC2 (`i-0bd32d6759af6d15b`, us-east-2): instala dependencias, `migrate`, `collectstatic`, reinicia gunicorn, comprueba salud y hace rollback al commit anterior si falla.
- La EC2 es **compartida** con el proyecto Restaurante (`qmanda360.com`). Ante cualquier duda de rutas/venv/socket, la verdad está en `/etc/systemd/system/<servicio>.service`, no en notas viejas.
- Si haces un cambio de carpeta/cutover en el servidor: copia también todo lo gitignored que sea estado real (`.env`, `media/` si no es S3, etc.), no solo `.env`.

## Deuda conocida / pendientes
- Emoji en `print()` (ver arriba) en 3 archivos del backend.
- Varias vistas de `contratos` y `solicitudes` siguen sin `permission_classes` ni validación de propiedad (p. ej. `EnviarReporteView`, `ContratosArrendatarioView` acepta cualquier `arrendatario_id` de la URL con solo estar autenticado). Auditarlas antes de exponerlas más.
- `ReporteNovedadesListView.post` es un duplicado sin uso del endpoint de creación.
