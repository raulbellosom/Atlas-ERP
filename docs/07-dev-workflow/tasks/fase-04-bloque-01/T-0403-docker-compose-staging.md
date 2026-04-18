# T-0403 - Crear `docker-compose.staging.yml`

## Metadatos
- ID: `T-0403`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Crear el docker-compose de staging con todos los servicios de servidor (infra + apps), usando variables de entorno inyectadas por CI/CD.

## Criterios de aceptación
- [x] `infra/docker/docker-compose.staging.yml` creado.
- [x] Servicios de infraestructura: postgres, redis, minio — sin puertos expuestos (solo red interna).
- [x] Servicios de app: api, worker, web, nginx.
- [x] Red interna `atlasrep-internal` tipo bridge — los servicios se comunican por nombre.
- [x] Variables de entorno via `${VAR}` — no hardcodeadas.
- [x] `depends_on` con condition `service_healthy` para api y worker.
- [x] Healthcheck en api: `GET /api/health`.
- [x] nginx en puerto 80, referencia a `infra/nginx/staging.conf`.
- [x] api se conecta a redis y minio por nombre de servicio (no localhost).

## Archivo creado
- `infra/docker/docker-compose.staging.yml`

## Diferencias vs docker-compose.dev.yml

| Aspecto              | dev                    | staging                              |
| -------------------- | ---------------------- | ------------------------------------ |
| Puertos expuestos    | 5432, 6379, 9000, 9001 | Solo 80 (nginx) — infra en red interna |
| Apps de servidor     | No                     | Si (api, worker, web, nginx)         |
| Variables de entorno | Hardcodeadas (local)   | Via ${VAR} desde CI/CD secrets       |
| Redis host en app    | localhost              | `redis` (nombre del servicio Docker) |
| MinIO host en app    | localhost              | `minio:9000` (nombre del servicio)   |

## Pendientes no resueltos
- `infra/nginx/staging.conf` — se crea en T-0411 (configuracion de red interna).
- Dockerfiles (api, worker, web) — se crean en T-0415-T-0417.
