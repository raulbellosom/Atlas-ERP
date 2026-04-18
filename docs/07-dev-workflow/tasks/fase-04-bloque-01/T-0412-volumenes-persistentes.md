# T-0412 - Configurar volúmenes persistentes

## Metadatos
- ID: `T-0412`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Documentar la estrategia de volumenes Docker de AtlasERP: que datos persisten, donde se almacenan y que comportamiento tienen ante reinicios, actualizaciones y resets de entorno.

## Criterios de aceptacion
- [x] Tres volumenes nombrados declarados: `postgres_data`, `redis_data`, `minio_data`.
- [x] Todos los docker-compose (dev, staging, prod) usan los mismos nombres de volumen.
- [x] Documentada la diferencia entre `docker compose down` vs `docker compose down -v`.
- [x] Documentada la ubicacion fisica de los datos en el host.
- [x] Estrategia de backup referenciada para cada volumen.

## Archivos modificados
- Configuracion ya materializada en los tres docker-compose files.

## Volumenes declarados

```yaml
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  minio_data:
    driver: local
```

### `postgres_data`
- **Contenido**: datos de PostgreSQL — tablas, indices, WAL, configuracion de extensiones.
- **Montaje**: `/var/lib/postgresql/data`
- **Critico**: Si se borra este volumen, se pierden todos los datos de la BD.
- **Backup**: obligatorio en prod (ver `docs/02-architecture/12-estrategia-backup.md`).
- **Reset en dev**: `pnpm infra:reset` borra este volumen y re-ejecuta migrations + seeds.

### `redis_data`
- **Contenido**: datos de Redis (AOF en prod, sin persistencia en dev/staging).
- **Montaje**: `/data`
- **Critico**: Solo en prod (contiene cola de jobs pendientes). En dev/staging, la perdida es aceptable.
- **Backup**: No requerido para MVP. Los jobs pendientes se pueden re-encolar manualmente.

### `minio_data`
- **Contenido**: objetos binarios — PDFs, adjuntos, exports, backups de BD.
- **Montaje**: `/data`
- **Critico**: Depende del contenido. Los exports son regenerables; los adjuntos de usuarios no.
- **Backup**: Recomendado en prod — sincronizar a bucket S3 externo periodicamente.

## Ciclo de vida de los volumenes

| Comando                            | Efecto en volumenes                              |
| ---------------------------------- | ------------------------------------------------ |
| `docker compose up -d`             | Monta volumenes existentes o los crea vacios     |
| `docker compose down`              | Para contenedores, volumenes intactos            |
| `docker compose down -v`           | Para contenedores + BORRA todos los volumenes    |
| `docker compose restart`           | Reinicia contenedores, volumenes intactos        |
| `docker volume rm <nombre>`        | Borra un volumen especifico                      |
| `docker volume ls`                 | Lista todos los volumenes del sistema            |

**IMPORTANTE**: `docker compose down -v` es DESTRUCTIVO. Solo usar en dev para reset completo.
El script `tools/reset-local.sh` usa este comando con confirmacion explicita del usuario.

## Ubicacion fisica en el host

Los volumenes Docker con driver `local` se almacenan en:
- **Linux/Mac**: `/var/lib/docker/volumes/<project>_<volume_name>/_data/`
- **Windows (Docker Desktop)**: dentro de la VM de Docker Desktop (no accesible directamente desde Windows Explorer)

Para acceder a los datos en produccion (Linux):
```bash
# Ruta del volumen de postgres en prod
docker volume inspect atlasrep_postgres_data
# → Mountpoint: /var/lib/docker/volumes/atlasrep_postgres_data/_data
```

## Naming de volumenes en docker-compose

Docker Compose prefixa los volumenes con el nombre del proyecto (directorio o `name` en compose):
- Dev: `atlasrep_postgres_data` (si el directorio del proyecto es `atlasrep`)
- Los tres ambientes comparten nombres de volumen logicos pero son volumenes fisicos distintos (distintos hosts).

## Estrategia de backup por volumen

| Volumen         | Frecuencia backup prod | Metodo                          |
| --------------- | ---------------------- | --------------------------------|
| `postgres_data` | Diaria                 | `pg_dump` → MinIO/S3 externo    |
| `redis_data`    | No requerido MVP       | Re-encolar jobs si es necesario |
| `minio_data`    | Semanal                | Sync a bucket S3 externo        |

Ver detalles en `docs/02-architecture/12-estrategia-backup.md`.

## Pendientes no resueltos
- Script automatico de backup de `postgres_data` — Fase 6 (CI/CD y operaciones).
- Configuracion de lifecycle policy de `minio_data` (expirar exports viejos) — Fase 5+.
