# Despliegue del frontend (Vite -> S3 -> CloudFront)

Cada merge a `main` que toque `inmobiliaria-vite/` compila y publica solo
(`.github/workflows/deploy-frontend.yml`). Los pull requests solo compilan, para comprobar que no se rompe nada.

## Que hace
1. `npm ci` y `npm run build` con `VITE_BASE_URL` (la URL de la API, queda visible en el navegador: sin secretos).
2. Sube a S3 **sin borrar** nada del bucket, con cache segun el tipo de archivo:
   - `assets/index-<hash>.js|css` (los genera Vite, el nombre cambia si cambia el contenido): 1 ano.
   - Lo que viene de `public/` (`images/`, `favicon.ico`, `assets/css/main2.css`) conserva su nombre: 1 hora.
   - `index.html`: sin cache, se sube al final para que nunca apunte a archivos que aun no estan.
3. Invalida la cache de CloudFront (`/*`) para que el cambio se vea de inmediato.

## Configuracion (una sola vez)
**Variables de GitHub** (*Settings -> Secrets and variables -> Actions -> Variables*):

| Variable | Valor |
|---|---|
| `S3_BUCKET` | `qmanda360camila360` |
| `VITE_BASE_URL` | `https://qmanda360.com/inmobiliarias` (sin `/` al final) |
| `CLOUDFRONT_ID` | el ID de la distribucion (ver abajo) |
| `AWS_ROLE_ARN`, `AWS_REGION` | las mismas que usa el deploy del backend |

**ID de CloudFront:** consola de AWS -> *CloudFront -> Distribuciones*. La columna **ID** (empieza por `E`, unas 14 letras
y numeros) esta en la fila cuyo *Nombre de dominio* es `d2xzv6q1daxyi1.cloudfront.net`. En su pestana *Origenes* debe
aparecer el bucket `qmanda360camila360`; si aparece otro, ese es el bucket del frontend. CloudFront es un servicio
global: no depende de la region que tengas seleccionada.

**Permisos del rol de GitHub** (el mismo `github-deploy-inmobiliarias`; anadir esta politica insertada y reemplazar
`ID_CUENTA` e `ID_DISTRIBUCION`):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListarBucketDelFrontend",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::qmanda360camila360"
    },
    {
      "Sid": "SubirArchivosDelFrontend",
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::qmanda360camila360/*"
    },
    {
      "Sid": "InvalidarCacheDeCloudFront",
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::ID_CUENTA:distribution/ID_DISTRIBUCION"
    }
  ]
}
```

## Primer despliegue y como volver atras
- Primera vez: *Actions -> Deploy frontend -> Run workflow* (rama `main`). Despues es automatico.
- Volver a una version anterior: `git revert` del commit problematico y merge; el workflow publica la anterior.
- Los archivos con hash de versiones viejas se quedan en el bucket (son inofensivos y casi no pesan).
