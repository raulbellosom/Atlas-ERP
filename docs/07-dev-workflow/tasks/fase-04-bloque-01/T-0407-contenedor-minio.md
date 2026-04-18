# T-0407 - Configurar contenedor de MinIO/S3 compatible

## Metadatos
- ID: `T-0407`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Documentar y materializar la configuracion completa del contenedor de MinIO como almacenamiento de objetos S3-compatible: imagen, credenciales, consola de administracion, healthcheck y diferencias por ambiente.

## Criterios de aceptacion
- [x] Imagen `minio/minio:latest` con comando `server /data --console-address ":9001"`.
- [x] Credenciales via `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` (inyectadas por CI/CD en staging/prod).
- [x] Dev: credenciales hardcodeadas locales, puertos 9000 y 9001 expuestos al host.
- [x] Staging/Prod: credenciales via `${S3_ACCESS_KEY}` / `${S3_SECRET_KEY}`, sin puertos expuestos.
- [x] Volumen nombrado `minio_data` para persistencia de objetos.
- [x] Healthcheck via `GET /minio/health/live`.
- [x] Apps conectan a MinIO por nombre de servicio `minio:9000`, no por `localhost`.
- [x] Variables de app: `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`.

## Archivos modificados
- Configuracion ya materializada en los tres docker-compose files (dev, staging, prod).

## Configuracion por ambiente

### Desarrollo (`docker-compose.dev.yml`)
```yaml
minio:
  image: minio/minio:latest
  command: server /data --console-address ":9001"
  environment:
    MINIO_ROOT_USER: atlasrep
    MINIO_ROOT_PASSWORD: atlasrep_dev
  ports:
    - "9000:9000"   # API S3
    - "9001:9001"   # Consola web de administracion
```
- Consola accesible en `http://localhost:9001` para explorar buckets en dev.
- Credenciales hardcodeadas: aceptable solo en desarrollo local.

### Staging y Produccion
```yaml
minio:
  image: minio/minio:latest
  command: server /data --console-address ":9001"
  environment:
    MINIO_ROOT_USER: ${S3_ACCESS_KEY}
    MINIO_ROOT_PASSWORD: ${S3_SECRET_KEY}
  # sin ports — solo accesible por red interna
```
- Consola de administracion disponible en la red interna (`:9001`) pero sin exposicion externa.
- Para acceder a la consola en staging/prod: tunnel SSH o acceso directo al servidor.

## Variables de entorno para las apps

```bash
S3_ENDPOINT=http://minio:9000   # nombre del servicio en red Docker interna
S3_ACCESS_KEY=${S3_ACCESS_KEY}
S3_SECRET_KEY=${S3_SECRET_KEY}
S3_BUCKET=${S3_BUCKET}
```

En desarrollo local (si la app corre fuera de Docker):
```bash
S3_ENDPOINT=http://localhost:9000
```

## Uso de MinIO en AtlasERP

| Uso                         | Descripcion                                          |
| --------------------------- | ---------------------------------------------------- |
| Adjuntos de documentos      | Facturas, contratos, archivos de compras             |
| Exportaciones generadas     | PDFs de reportes, exports CSV/XLSX del worker        |
| Backups de BD               | Snapshots de PostgreSQL (estrategia de backup)       |
| Assets de usuarios          | Logos de empresa, avatares (si aplica en futuro)     |

## Healthcheck
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
  interval: 30s
  timeout: 20s
  retries: 5
  start_period: 30s
```
- MinIO puede tardar mas en arrancar que Redis o Postgres.
- `start_period: 30s` en prod evita falsos negativos en el healthcheck inicial.

## Decisiones tecnicas
- **MinIO vs AWS S3 real**: en dev/staging se usa MinIO; en prod se puede usar MinIO self-hosted o AWS S3 real sin cambios en el codigo (misma API S3).
- **`minio/minio:latest`**: a diferencia de postgres/redis, MinIO no tiene una convencion de tags de LTS estable. En prod se puede fijar a un digest especifico si se requiere reproducibilidad.
- **Bucket creacion manual**: el bucket inicial (`${S3_BUCKET}`) se crea manualmente via consola o script de bootstrap. No se autocrea en el init (MinIO no tiene initdb.d).
- **Politicas de acceso**: los buckets se crean como privados por defecto. La API accede via credenciales, no via URL publica.

## Pendientes no resueltos
- Script de creacion automatica del bucket inicial — mejora opcional post-MVP.
- Politicas de ciclo de vida de objetos (expirar exports viejos) — Fase 5+.
- Configuracion de CORS para uploads directos desde el frontend — Fase 5+.
