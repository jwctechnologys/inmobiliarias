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
APP="$APP" SOCKET="$SOCKET" bash "$APP/deploy/salud.sh"

log "Despliegue correcto"
