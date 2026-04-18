# T-0402 - Crear `docker-compose.dev.yml`

## Metadatos
- ID: `T-0402`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Crear el archivo docker-compose para el ambiente de desarrollo local con los 3 servicios de infraestructura.

## Criterios de aceptación
- [x] `infra/docker/docker-compose.dev.yml` existe (creado en T-0318, Fase 3).
- [x] Servicio `postgres` — postgres:16-alpine, puerto 5432, volume nombrado, healthcheck.
- [x] Servicio `redis` — redis:7-alpine, puerto 6379, volume nombrado, healthcheck.
- [x] Servicio `minio` — minio/minio:latest, puertos 9000 (API) y 9001 (consola), healthcheck.
- [x] `restart: unless-stopped` en todos los servicios.
- [x] Volumes nombrados declarados: postgres_data, redis_data, minio_data.
- [x] Credenciales de desarrollo hardcodeadas (coinciden con .env.example).

## Archivo
- `infra/docker/docker-compose.dev.yml` — verificado completo ✓

## Nota
Este archivo fue creado en T-0318 (Fase 3 / Bloque 4) como parte de los scripts de infraestructura. La verificacion formal ocurre en esta task de Fase 4.

## Pendientes no resueltos
- Ninguno.
