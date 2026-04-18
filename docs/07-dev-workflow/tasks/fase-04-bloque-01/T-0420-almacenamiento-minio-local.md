# T-0420 - Configurar almacenamiento persistente local de MinIO

## Metadatos
- ID: `T-0420`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Documentar la configuracion de almacenamiento persistente de MinIO en desarrollo local: volumen Docker, bucket inicial, estructura de prefijos y acceso via consola web.

## Criterios de aceptacion
- [x] Volumen `minio_data` declarado en docker-compose.dev.yml.
- [x] Bucket inicial `atlasrep-files` documentado (se crea via `tools/infra-up.sh` o manualmente).
- [x] Estructura de prefijos/directorios dentro del bucket documentada.
- [x] Acceso via consola web: `http://localhost:9001`.
- [x] Variables de entorno para las apps documentadas.
- [x] Datos sobreviven `docker compose down` (solo se borran con `down -v`).

## Configuracion Docker

```yaml
# docker-compose.dev.yml
minio:
  image: minio/minio:latest
  command: server /data --console-address ":9001"
  environment:
    MINIO_ROOT_USER: atlasrep
    MINIO_ROOT_PASSWORD: atlasrep_dev
  ports:
    - "9000:9000"   # API S3-compatible
    - "9001:9001"   # Consola web
  volumes:
    - minio_data:/data   # persistencia

volumes:
  minio_data:    # volumen nombrado Docker
```

## Bucket inicial

| Bucket          | Ambiente  | Descripcion                         |
| --------------- | --------- | ----------------------------------- |
| `atlasrep-files`| Dev/Staging/Prod | Bucket unico para todos los archivos |

### Estructura de prefijos dentro del bucket

```
atlasrep-files/
├── uploads/          # Archivos subidos por usuarios (adjuntos, documentos)
│   ├── compras/      # Facturas de proveedores, OC adjuntas
│   ├── ventas/       # Facturas de venta, remisiones
│   └── inventario/   # Fotos de productos, documentos de inventario
├── exports/          # Archivos generados por el worker (reportes)
│   ├── pdf/          # Reportes PDF
│   └── xlsx/         # Exportaciones Excel
└── backups/          # Backups de PostgreSQL (solo en prod)
```

## Acceso local

### Consola web (MinIO Console)
- URL: `http://localhost:9001`
- Usuario: `atlasrep`
- Password: `atlasrep_dev`

La consola permite explorar buckets, subir/bajar archivos y ver estadisticas de uso.
Es util para debugging de uploads y exports durante el desarrollo.

### CLI con mc (MinIO Client)
```bash
# Configurar alias
mc alias set atlasrep-local http://localhost:9000 atlasrep atlasrep_dev

# Listar buckets
mc ls atlasrep-local/

# Listar contenido del bucket
mc ls atlasrep-local/atlasrep-files/

# Subir archivo de prueba
mc cp archivo.pdf atlasrep-local/atlasrep-files/uploads/

# Borrar archivo
mc rm atlasrep-local/atlasrep-files/uploads/archivo.pdf
```

### API S3 con curl
```bash
# Verificar que MinIO esta listo
curl http://localhost:9000/minio/health/live

# Las apps usan el SDK de AWS S3 (compatible con MinIO)
# Ver apps/api/src/ para ejemplos de uso del cliente S3
```

## Variables de entorno para las apps (desarrollo local)

```bash
# apps/api/.env
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=atlasrep
S3_SECRET_KEY=atlasrep_dev
S3_BUCKET=atlasrep-files
```

Cuando la API corre dentro de Docker (staging/prod), `S3_ENDPOINT` cambia a `http://minio:9000`.

## Persistencia de datos

- `docker compose down` → datos conservados (volumen intacto).
- `docker compose down -v` → datos BORRADOS (volumen eliminado).
- `tools/reset-local.sh` → borra volumenes y vuelve a crear desde cero.

## Pendientes no resueltos
- Politica de ciclo de vida para expirar exports viejos — Fase 5+.
- CORS configuration para uploads directos desde el browser — Fase 5+.
- Script de creacion de bucket en CI/CD (staging/prod) — Fase 6.
