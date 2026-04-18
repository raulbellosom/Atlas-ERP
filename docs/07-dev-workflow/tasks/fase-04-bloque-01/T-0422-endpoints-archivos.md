# T-0422 - Configurar endpoint interno y externo de archivos

## Metadatos
- ID: `T-0422`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Documentar los dos endpoints de MinIO/S3 que usa AtlasERP — el interno (Docker network) y el externo (host/internet) — y como cada contexto (apps en Docker vs apps en host) debe configurar `S3_ENDPOINT`.

## Criterios de aceptacion
- [x] Endpoint interno documentado: `http://minio:9000` (nombre de servicio Docker).
- [x] Endpoint externo documentado: `http://localhost:9000` (acceso desde el host).
- [x] Regla clara: en Docker → nombre de servicio; fuera de Docker → localhost.
- [x] Presigned URLs: el endpoint publico de las URLs firmadas debe ser el externo (o el dominio real).
- [x] Variables de entorno por contexto documentadas.

## Endpoints de MinIO

### Endpoint interno (Docker network)
```
http://minio:9000
```
- Usado por: `api` y `worker` cuando corren DENTRO de Docker (staging/prod).
- El nombre `minio` es resuelto por el DNS interno de Docker via la red `atlasrep-internal`.
- No accesible desde el host ni desde internet.

### Endpoint externo (host)
```
http://localhost:9000
```
- Usado por: `api` y `worker` cuando corren en el HOST (desarrollo local sin Docker).
- Accesible desde: el sistema operativo del desarrollador.
- Accesible desde: el browser (para presigned URLs en dev).

### Endpoint de produccion
```
https://files.tu-dominio.com   # si se expone MinIO publicamente
```
O con nginx como proxy:
```
https://tu-dominio.com/files   # si nginx proxea /files/* a MinIO
```
La estrategia de exposicion de MinIO en prod se decide en Fase 6 (CI/CD y operaciones).

## Variables de entorno por contexto

| Contexto                      | S3_ENDPOINT              |
| ----------------------------- | ------------------------ |
| Dev: app en HOST              | `http://localhost:9000`  |
| Dev: app en Docker            | `http://minio:9000`      |
| Staging: app en Docker        | `http://minio:9000`      |
| Prod: app en Docker           | `http://minio:9000`      |
| Prod: usando AWS S3 real      | `https://s3.amazonaws.com` (o URL regional) |

## Presigned URLs en desarrollo

Las presigned URLs generadas por la API incluyen el endpoint como base de la URL:
```
# Si API usa http://minio:9000 (dentro de Docker):
Presigned URL = http://minio:9000/atlasrep-files/uploads/...?X-Amz-Signature=...
# ❌ El browser no puede resolver "minio" (es un nombre interno de Docker)
```

**Solucion**: la API debe usar el endpoint PUBLICO para generar presigned URLs:
```bash
# Variable adicional para generacion de presigned URLs:
S3_PUBLIC_URL=http://localhost:9000   # dev
S3_PUBLIC_URL=https://tu-dominio.com  # prod
```
Esto se implementa en Fase 5 al crear el modulo Files de NestJS.

## Resumen de variables S3 necesarias

```bash
S3_ENDPOINT=http://minio:9000       # endpoint interno (acceso server-side)
S3_PUBLIC_URL=http://localhost:9000 # endpoint publico (presigned URLs para browser)
S3_ACCESS_KEY=atlasrep
S3_SECRET_KEY=atlasrep_dev
S3_BUCKET=atlasrep-files
S3_REGION=us-east-1                 # MinIO ignora la region pero el SDK la requiere
```

## Pendientes no resueltos
- `S3_PUBLIC_URL` se usara en Fase 5 al implementar presigned URLs.
- Exposicion de MinIO en prod (subdomain vs path proxy) — decision de Fase 6.
