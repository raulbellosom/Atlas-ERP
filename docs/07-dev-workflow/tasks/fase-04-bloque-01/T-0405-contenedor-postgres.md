# T-0405 - Configurar contenedor de PostgreSQL

## Metadatos
- ID: `T-0405`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Documentar y materializar la configuracion completa del contenedor de PostgreSQL: imagen, healthcheck, volumen, script de inicializacion, extensiones requeridas y timezone.

## Criterios de aceptacion
- [x] Imagen `postgres:16-alpine` — version LTS fijada, footprint minimo.
- [x] Variables de entorno: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` via `${VAR}`.
- [x] Volumen nombrado `postgres_data` para persistencia entre reinicios.
- [x] Healthcheck: `pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}`.
- [x] `infra/scripts/postgres-init.sh` creado — instala extensiones y configura timezone.
- [x] Extensiones: `pgcrypto` (hashing/UUIDs) y `uuid-ossp` (generacion UUID).
- [x] Timezone de BD fijado en `UTC`.
- [x] Script montado via `docker-entrypoint-initdb.d/` (solo corre en primer arranque).
- [x] Red interna `atlasrep-internal` — sin puerto 5432 expuesto en staging/prod.

## Archivos creados
- `infra/scripts/postgres-init.sh`

## Configuracion aplicada

### Imagen y version
```yaml
image: postgres:16-alpine
```
- PostgreSQL 16 LTS: soporte hasta noviembre 2028.
- Alpine: imagen base minima, menor superficie de ataque.

### Healthcheck
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
  interval: 10s
  timeout: 5s
  retries: 10
  start_period: 30s   # solo en prod
```
- `api` y `worker` usan `depends_on: condition: service_healthy`.
- Sin healthcheck sano, los servicios de app no arrancan.

### Script de inicializacion
```bash
infra/scripts/postgres-init.sh
```
- Se ejecuta SOLO en el primer arranque (volumen vacio).
- Instala extensiones `pgcrypto` y `uuid-ossp`.
- Fija timezone de la BD en UTC.
- NO crea schemas ni tablas — eso es responsabilidad de Prisma migrations.

### Volumen
```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```
- Volumen nombrado Docker — sobrevive `docker compose down`.
- Para borrar datos: `docker compose down -v` (destructivo, solo en dev/reset).

## Decisiones tecnicas
- **Sin puerto expuesto en staging/prod**: postgres solo accesible desde la red interna `atlasrep-internal`.
- **Puerto 5432 expuesto solo en dev**: `docker-compose.dev.yml` lo expone para acceso desde herramientas locales (DBeaver, psql host).
- **UTC como timezone obligatorio**: evita bugs de conversion de fechas entre app y BD.
- **Extensiones en init script, no en migration**: las extensiones son infraestructura de BD, no schema de aplicacion.

## Pendientes no resueltos
- Prisma schema y primeras migrations — se crean en Fase 5 (T-0500+).
- Configuracion de backup de postgres_data — referenciado en `docs/02-architecture/12-estrategia-backup.md`.
