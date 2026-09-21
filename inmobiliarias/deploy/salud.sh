#!/usr/bin/env bash
# Comprueba que la app responde por el socket de gunicorn (sin pasar por nginx).
#
# Uso:  bash ~/qmanda360/inmobiliarias/deploy/salud.sh      (codigo de salida 0 = responde, 1 = no)
# deploy.sh lo ejecuta despues de cada despliegue; tambien sirve para revisar a mano.
set -uo pipefail

BASE="${BASE:-/home/ec2-user/qmanda360}"
APP="${APP:-$BASE/inmobiliarias}"                    # carpeta con manage.py y .env
SOCKET="${SOCKET:-$BASE/inmobiliarias/inmobiliarias.sock}"
RUTA="${RUTA:-/api/csrf/}"
INTENTOS="${INTENTOS:-10}"
ESPERA="${ESPERA:-2}"

# Django rechaza Host que no este en ALLOWED_HOSTS: usa el primero de la lista.
host="$(grep -E '^ALLOWED_HOSTS=' "$APP/.env" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | cut -d, -f1)"
if [[ -z "$host" || "$host" == "*" ]]; then host="localhost"; fi

code=""
for ((i = 1; i <= INTENTOS; i++)); do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 --unix-socket "$SOCKET" \
          -H "Host: $host" "http://localhost$RUTA" || true)"
  # 2xx-4xx = Django atendio la peticion; 5xx o 000 (sin conexion) = algo va mal
  if [[ "$code" =~ ^[234][0-9][0-9]$ ]]; then
    echo "OK: la app responde (HTTP $code)"
    exit 0
  fi
  sleep "$ESPERA"
done

echo "FALLA: la app no responde por $SOCKET (ultimo codigo: ${code:-ninguno})"
echo "Revisa: sudo systemctl status inmobiliarias  |  sudo journalctl -u inmobiliarias -n 30 --no-pager"
exit 1
