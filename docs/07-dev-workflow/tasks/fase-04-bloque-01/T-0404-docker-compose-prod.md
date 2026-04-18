# T-0404 - Crear `docker-compose.prod.yml`

## Metadatos
- ID: `T-0404`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Crear el docker-compose de produccion con configuraciones de seguridad, estabilidad y observabilidad adicionales respecto a staging.

## Criterios de aceptacion
- [x] `infra/docker/docker-compose.prod.yml` creado.
- [x] `restart: always` en todos los servicios (vs `unless-stopped` en staging).
- [x] Redis con autenticacion: `--requirepass ${REDIS_PASSWORD} --appendonly yes`.
- [x] Logging configurado por servicio: `driver: json-file`, limites de `max-size` y `max-file`.
- [x] `IMAGE_TAG` variable para control de versiones de imagen: `${IMAGE_TAG:-latest}`.
- [x] nginx en puertos 80 y 443 con volumen de certificados letsencrypt.
- [x] `start_period` en healthchecks para arranques lentos en prod.
- [x] Script de inicializacion de postgres: `infra/scripts/postgres-init.sh` montado como initdb.
- [x] Variables de entorno via `${VAR}` — no hardcodeadas.
- [x] Red interna `atlasrep-internal` — infra sin puertos expuestos salvo nginx.

## Archivo creado
- `infra/docker/docker-compose.prod.yml`

## Diferencias vs docker-compose.staging.yml

| Aspecto              | staging                        | prod                                          |
| -------------------- | ------------------------------ | --------------------------------------------- |
| restart policy       | `unless-stopped`               | `always`                                      |
| Redis autenticacion  | Solo password env              | `--requirepass` en comando + `--appendonly yes` |
| Logging              | Sin configurar                 | `json-file` con `max-size` y `max-file`       |
| nginx puertos        | 80                             | 80 + 443 con letsencrypt                      |
| IMAGE_TAG            | No (usa latest)                | `${IMAGE_TAG:-latest}` para rollback          |
| Healthcheck timing   | Sin `start_period`             | `start_period` en api (60s) y postgres (30s)  |
| postgres init script | No                             | `postgres-init.sh` via initdb.d               |

## Pendientes no resueltos
- `infra/scripts/postgres-init.sh` — se crea en T-0405 (configuracion de PostgreSQL).
- `infra/nginx/prod.conf` — se crea en T-0411 (configuracion de nginx prod).
- Dockerfiles (api, worker, web) — se crean en T-0415-T-0417.
