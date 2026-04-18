# T-0318 - Configurar scripts para levantar infraestructura local

## Metadatos
- ID: `T-0318`
- Fase: `Fase 3`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Crear el docker-compose de desarrollo local con PostgreSQL, Redis y MinIO, y completar los scripts de infra en el package.json raíz.

## Criterios de aceptación
- [x] `infra/docker/docker-compose.dev.yml` creado con postgres:16, redis:7 y minio:latest.
- [x] Healthchecks definidos para los 3 servicios.
- [x] Volumes con nombre para persistencia entre reinicios.
- [x] Credenciales de desarrollo hardcodeadas (solo local — coinciden con `.env.example`).
- [x] Scripts raíz completos:
  - `infra:up` — levanta servicios en background.
  - `infra:down` — detiene servicios (sin borrar datos).
  - `infra:reset` — detiene servicios y elimina volumes (reset total).
  - `infra:logs` — tail de logs de todos los servicios.
  - `infra:status` — estado de los contenedores.

## Archivos creados/modificados
- `infra/docker/docker-compose.dev.yml`
- `package.json` (raíz) — scripts `infra:logs` e `infra:status` añadidos

## Servicios y puertos

| Servicio  | Imagen           | Puerto(s)      | Uso                        |
| --------- | ---------------- | -------------- | -------------------------- |
| postgres  | postgres:16-alpine | 5432          | Base de datos principal     |
| redis     | redis:7-alpine   | 6379           | BullMQ + caché             |
| minio     | minio/minio:latest | 9000, 9001   | S3-compatible + consola UI |

## Credenciales locales de desarrollo
- PostgreSQL: `atlasrep` / `atlasrep_dev` / DB: `atlasrep_dev`
- MinIO: `atlasrep` / `atlasrep_dev`
- Estas credenciales están en `apps/api/.env.example` — no usar en producción.

## Decisiones técnicas
- **Solo 3 servicios en dev**: Sin nginx — el dev server de Vite/NestJS sirve directamente.
- **postgres:16-alpine**: Versión LTS, imagen slim para desarrollo.
- **MinIO console en 9001**: Permite gestionar buckets desde `http://localhost:9001`.
- **`infra:reset` borra volumes**: Útil para testear migraciones desde cero.

## Pendientes no resueltos
- `infra/docker/docker-compose.staging.yml` y `docker-compose.prod.yml` se crean en Fase 4.
