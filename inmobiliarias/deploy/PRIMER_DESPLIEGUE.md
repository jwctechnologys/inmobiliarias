# Primer despliegue y deploy automatico

Despues de esto, cada `merge` a `main` que toque `inmobiliarias/` despliega solo
(`.github/workflows/deploy-backend.yml`): tests -> SSM -> `deploy/deploy.sh` -> comprobacion de salud
-> vuelta atras automatica si falla.

## 0. Antes de empezar
- El PR con la reestructuracion, el almacenamiento y este deploy ya esta en `main`.
- Bucket configurado (ver "Archivos subidos (S3)" en `README.md`).
- La EC2 aparece en *Systems Manager -> Fleet Manager* (el rol lleva `AmazonSSMManagedInstanceCore`).

## 1. Base de datos nueva DENTRO de la instancia de RDS que ya tienes
Crear otra instancia de RDS costaria otra factura completa; una base nueva dentro de la existente no
cuesta nada. Se recomienda usar la instancia de Restaurante (`restaurante-1`, tiene datos reales) y, cuando
todo funcione, eliminar la de inmobiliarias (solo tenia datos de prueba).

En la EC2, instalar el cliente y conectar como usuario administrador de esa instancia:
```bash
sudo dnf install -y postgresql16        # o postgresql15
curl -o ~/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem   # certificado oficial de RDS
psql "host=ENDPOINT_DE_RDS port=5432 dbname=postgres user=USUARIO_ADMIN sslmode=verify-full sslrootcert=$HOME/global-bundle.pem"
```
Generar una contrasena nueva (larga, solo letras y numeros, que no hayas usado en otro sitio; guardala en un
gestor de contrasenas porque tambien va en el `.env`):
```bash
openssl rand -base64 24 | tr -d '/+='
```
Ya dentro de psql, dejar el rol sin contrasena y ponerla con `\password`: la pide sin mostrarla y no queda en texto
claro en el historial de psql (`~/.psql_history`), como pasaria con `CREATE ROLE ... PASSWORD '...'`.
```sql
CREATE ROLE inmobiliarias_app LOGIN;
\password inmobiliarias_app
GRANT inmobiliarias_app TO USUARIO_ADMIN;            -- RDS lo exige para poder crear la base a su nombre
CREATE DATABASE inmobiliarias OWNER inmobiliarias_app;
REVOKE ALL ON DATABASE inmobiliarias FROM PUBLIC;    -- solo su dueno puede entrar
\l inmobiliarias                                     -- comprobar: el dueno debe ser inmobiliarias_app
```
Cada app queda con su propio usuario y no puede leer la base de la otra.

## 2. En el servidor (una sola vez)
**Llave de solo lectura para clonar el repo privado**
```bash
ssh-keygen -t ed25519 -C "ec2-inmobiliarias-deploy" -f ~/.ssh/deploy_inmobiliarias -N ""
cat ~/.ssh/deploy_inmobiliarias.pub
```
Copiar esa linea en GitHub: repo -> *Settings -> Deploy keys -> Add deploy key* (sin "Allow write access").
```bash
printf 'Host github-inmobiliarias\n  HostName github.com\n  User git\n  IdentityFile ~/.ssh/deploy_inmobiliarias\n  IdentitiesOnly yes\n' >> ~/.ssh/config
ssh-keyscan github.com >> ~/.ssh/known_hosts
git clone git@github-inmobiliarias:jwctechnologys/inmobiliarias.git ~/qmanda360/repo_inmobiliarias
```

**Configuracion (`.env`)** — partir de la actual y cambiar la base de datos:
```bash
cp ~/qmanda360/inmobiliarias/.env ~/qmanda360/repo_inmobiliarias/inmobiliarias/.env
chmod 600 ~/qmanda360/repo_inmobiliarias/inmobiliarias/.env
nano ~/qmanda360/repo_inmobiliarias/inmobiliarias/.env
```
Poner `DB_HOST` (endpoint de RDS), `DB_NAME=inmobiliarias`, `DB_USER=inmobiliarias_app`, `DB_PASSWORD="..."` (entre
comillas) y una `DJANGO_SECRET_KEY` nueva (`python -c "import secrets; print(secrets.token_urlsafe(50))"`).
Anadir las variables de `.env.example` que falten (`USE_S3=1`, bucket, region). **Sin claves de AWS.**

**Prueba SIN tocar produccion** (la app vieja sigue sirviendo mientras tanto):
```bash
cd ~/qmanda360/repo_inmobiliarias/inmobiliarias && source ~/qmanda360/venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```
Comprobar el rol de IAM y el bucket de punta a punta (sube, lee y borra un archivo en cada zona):
```bash
python manage.py shell -c "
from django.core.files.base import ContentFile
from django.core.files.storage import storages
for zona in ('default', 'private_media'):
    s = storages[zona]; n = s.save('prueba/hola.txt', ContentFile(b'hola'))
    print(zona, '->', s.url(n)); s.delete(n)
"
```
Para la zona `default` (publica) la URL impresa se puede abrir en el navegador antes del `delete`; si da
`AccessDenied`, falta la politica del bucket.

**Cambiar el servicio a la carpeta nueva** (nginx y systemd no cambian: la ruta vieja pasa a ser un enlace)
```bash
sudo systemctl stop inmobiliarias
mv ~/qmanda360/inmobiliarias ~/qmanda360/inmobiliarias_old
ln -s ~/qmanda360/repo_inmobiliarias/inmobiliarias ~/qmanda360/inmobiliarias
sudo systemctl start inmobiliarias
```
Actualizar tambien el servicio de systemd con `--timeout 120` (por defecto gunicorn corta a los 30 s y las subidas de
video/PDF pueden tardar mas). **Reescribir el archivo entero, con el comando de gunicorn en UNA sola linea**: editar a
mano las barras `\` de continuacion es lo que mas falla (una barra suelta o un espacio detras y gunicorn sale con
codigo 2):
```bash
sudo tee /etc/systemd/system/inmobiliarias.service > /dev/null <<'EOF'
[Unit]
Description=Servicio Gunicorn para inmobiliarias
After=network.target

[Service]
User=ec2-user
Group=nginx
WorkingDirectory=/home/ec2-user/qmanda360/inmobiliarias
Environment="PATH=/home/ec2-user/qmanda360/venv/bin"

ExecStart=/home/ec2-user/qmanda360/venv/bin/gunicorn --workers 3 --timeout 120 --bind unix:/home/ec2-user/qmanda360/inmobiliarias/inmobiliarias.sock --access-logfile - --error-logfile - --capture-output inmobiliarias.wsgi:application

Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload && sudo systemctl reset-failed inmobiliarias; sudo systemctl restart inmobiliarias
```
Comprobar que responde (sirve tambien en cualquier momento): `bash ~/qmanda360/inmobiliarias/deploy/salud.sh`

**Volver atras si algo sale mal** (la carpeta y la base de datos viejas siguen intactas):
```bash
sudo systemctl stop inmobiliarias
rm ~/qmanda360/inmobiliarias
mv ~/qmanda360/inmobiliarias_old ~/qmanda360/inmobiliarias
sudo systemctl start inmobiliarias
```

## 3. En AWS: rol para GitHub (sin claves)
1. *IAM -> Proveedores de identidad -> Agregar*: OpenID Connect, URL `https://token.actions.githubusercontent.com`,
   audiencia `sts.amazonaws.com` (una sola vez por cuenta).
2. *IAM -> Roles -> Crear rol -> Identidad web*: ese proveedor, organizacion `jwctechnologys`, repositorio
   `inmobiliarias`, rama `main`. Nombre sugerido: `github-deploy-inmobiliarias`.
3. Politica de permisos del rol (reemplazar `ID_CUENTA` e `ID_INSTANCIA`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "EnviarComandoALaInstancia",
         "Effect": "Allow",
         "Action": "ssm:SendCommand",
         "Resource": [
           "arn:aws:ec2:us-east-2:ID_CUENTA:instance/ID_INSTANCIA",
           "arn:aws:ssm:us-east-2::document/AWS-RunShellScript"
         ]
       },
       {
         "Sid": "LeerResultado",
         "Effect": "Allow",
         "Action": ["ssm:GetCommandInvocation", "ssm:ListCommandInvocations"],
         "Resource": "*"
       }
     ]
   }
   ```
   Para el frontend, el mismo rol necesita ademas `s3:ListBucket`/`s3:PutObject` sobre su bucket y
   `cloudfront:CreateInvalidation` (ver la cabecera de `deploy-frontend.yml`).

## 4. En GitHub
*Settings -> Secrets and variables -> Actions -> Variables*: `AWS_ROLE_ARN` (ARN del rol anterior),
`AWS_REGION` (`us-east-2`) y `EC2_INSTANCE_ID` (`i-...`).

## 5. Despues
- Revisar la app a mano cuando quieras: `bash ~/qmanda360/inmobiliarias/deploy/salud.sh` (responde OK o FALLA).
  Atajo: `echo "alias salud='bash ~/qmanda360/inmobiliarias/deploy/salud.sh'" >> ~/.bashrc`; en una sesion nueva
  basta escribir `salud`.
- Los pull requests solo corren las pruebas; el despliegue ocurre unicamente al hacer merge a `main`.
- Cuando la app nueva lleve una semana estable: sacar un snapshot final de la instancia de RDS vieja,
  eliminarla y borrar `~/qmanda360/inmobiliarias_old`.
