#!/usr/bin/env bash
# Despliegue del backend en la EC2. Lo ejecuta GitHub Actions por SSM, como ec2-user, DESPUES de
# dejar el repo en el commit a desplegar (git fetch + git reset --hard <sha>).
#
# Que hace: instala dependencias, aplica migraciones, recolecta estaticos, reinicia gunicorn y
# comprueba que responde. Si algo falla, vuelve al commit anterior (PREV_COMMIT) y reinicia.
# Ojo: las migraciones ya aplicadas NO se revierten; escribelas compatibles con la version anterior.
set -Eeuo pipefail

BASE="${BASE:-/home/ec2-user/qmanda360}"
REPO="${REPO:-$BASE/repo_inmobiliarias}"
APP="$REPO/inmobiliarias"                  # carpeta con manage.py
VENV="${VENV:-$BASE/venv}"
SERVICE="${SERVICE:-inmobiliarias}"
SOCKET="${SOCKET:-$BASE/inmobiliarias/inmobiliarias.sock}"
PREV_COMMIT="${PREV_COMMIT:-}"

log() { printf '\n==> %s\n' "$*"; }

rollback() {
  local code=$?
  echo "!! El despliegue fallo (codigo $code)."
  if [[ -n "$PREV_COMMIT" ]]; then
    echo "!! Volviendo al commit anterior: $PREV_COMMIT"
    git -C "$REPO" reset -q --hard "$PREV_COMMIT"
    "$VENV/bin/pip" install -q -r "$APP/requirements.txt" || true
    sudo systemctl restart "$SERVICE" || true
  fi
  exit "$code"
}
trap rollback ERR

# Responde algo distinto de un error del servidor? (200-499 = Django atendio la peticion)
health_check() {
  local host code
  host="$(grep -E '^ALLOWED_HOSTS=' "$APP/.env" | head -1 | cut -d= -f2- | tr -d '"' | cut -d, -f1)"
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 --unix-socket "$SOCKET" \
            -H "Host: ${host:-localhost}" http://localhost/api/csrf/ || true)"
    if [[ "$code" =~ ^[234][0-9][0-9]$ ]]; then echo "Respuesta: HTTP $code"; return 0; fi
    sleep 2
  done
  echo "Sin respuesta valida del socket (ultimo codigo: ${code:-ninguno})"
  return 1
}

cd "$APP"
log "Commit a desplegar: $(git -C "$REPO" rev-parse --short HEAD) (anterior: ${PREV_COMMIT:0:7})"

log "Dependencias"
"$VENV/bin/pip" install -q -r requirements.txt

log "Migraciones"
"$VENV/bin/python" manage.py migrate --noinput

log "Archivos estaticos"
"$VENV/bin/python" manage.py collectstatic --noinput -v0

log "Reiniciando $SERVICE"
sudo systemctl restart "$SERVICE"

log "Comprobacion de salud"
health_check

log "Despliegue correcto"
