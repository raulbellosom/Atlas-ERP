# T-0414 - Configurar dependencia entre servicios

## Metadatos
- ID: `T-0414`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Documentar el grafo de dependencias entre servicios Docker de AtlasERP y verificar que el uso de `depends_on` con condiciones de healthcheck garantiza un arranque ordenado y libre de errores de conexion.

## Criterios de aceptacion
- [x] `api` depende de `postgres: service_healthy` y `redis: service_healthy`.
- [x] `worker` depende de `postgres: service_healthy` y `redis: service_healthy`.
- [x] `nginx` depende de `api: service_healthy` y `web: service_started`.
- [x] `postgres`, `redis`, `minio` sin dependencias (arrancan primero).
- [x] `web` sin dependencias (contenedor de estaticos, no necesita infra).
- [x] Documentada la diferencia entre `service_healthy`, `service_started` y `service_completed_successfully`.

## Archivos modificados
- Configuracion ya materializada en docker-compose.staging.yml y docker-compose.prod.yml.

## Grafo de dependencias

```
postgres ──────────────────────────────────────────────►┐
                                                         │
redis ──────────────────────────────────────────────────►├──► api (healthy) ──►┐
                                                         │                      │
minio ──────────────────────────────────────────────────►┘                      ├──► nginx (started)
                                                                                │
postgres ──────────────────────────────────────────────►┐                      │
                                                         ├──► worker (started)  │
redis ──────────────────────────────────────────────────►┘                      │
                                                                                │
web ─────────────────────────────────────────────────────────────────────────►┘
```

## Configuracion de `depends_on` por servicio

### API
```yaml
api:
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
```
- NestJS intenta conectar a PostgreSQL via Prisma al arrancar.
- NestJS conecta a Redis (BullMQ, cache) al arrancar.
- Sin postgres/redis sanos, NestJS falla en el modulo de inicializacion.

### Worker
```yaml
worker:
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
```
- El worker necesita Redis para consumir la cola de BullMQ.
- El worker necesita PostgreSQL para leer/escribir datos al procesar jobs.

### nginx
```yaml
nginx:
  depends_on:
    api:
      condition: service_healthy
    web:
      condition: service_started
```
- nginx no tiene sentido si la API no esta lista (proxiaria requests a un proceso caido).
- `web` usa `service_started` porque el contenedor de estaticos arranca muy rapido y no tiene endpoint de health.

## Condiciones de `depends_on`

| Condicion                        | Significado                                          | Cuando usar                        |
| -------------------------------- | ---------------------------------------------------- | ---------------------------------- |
| `service_started`                | El contenedor ha arrancado (proceso corriendo)       | Para servicios que arrancan rapido y no tienen health |
| `service_healthy`                | El healthcheck ha pasado al menos una vez            | Para servicios con healthcheck definido |
| `service_completed_successfully` | El contenedor termino con exit code 0                | Para jobs/migraciones de una sola vez |

**AtlasERP usa**:
- `service_healthy`: postgres, redis, api
- `service_started`: web

**No se usa** `service_completed_successfully` en esta fase — podria ser util para un contenedor de migraciones en Fase 5 (`prisma migrate deploy`).

## Comportamiento ante fallos

### Si postgres no arranca (unhealthy)
- `api` y `worker` no arrancan.
- nginx no arranca (depende de api).
- El sistema completo falla de forma limpia.

### Si redis no arranca (unhealthy)
- Mismo efecto: `api` y `worker` no arrancan.

### Si minio no arranca
- `api` y `worker` SI arrancan (no hay `depends_on: minio`).
- La API responde, pero los endpoints que usan S3 fallan con error de conexion.
- Comportamiento aceptable: el cliente S3 en NestJS tiene reintentos.

### Si web no arranca
- nginx no arranca.
- La API esta funcionando pero no es accesible publicamente.

## Migraciones de base de datos

En esta fase, las migraciones de Prisma se ejecutan manualmente o via script antes de desplegar.
En Fase 5 se evaluara si agregar un contenedor efimero de migraciones:
```yaml
# Ejemplo para Fase 5 (no implementado aun):
migrate:
  image: atlasrep/api:${IMAGE_TAG:-latest}
  command: ["node", "node_modules/.bin/prisma", "migrate", "deploy"]
  depends_on:
    postgres:
      condition: service_healthy
  # condition: service_completed_successfully para que api espere
```

## Pendientes no resueltos
- Contenedor de migraciones one-shot — se evaluara en Fase 5.
- Reintentos de conexion a nivel de aplicacion (Prisma reconnect, BullMQ retry) — Fase 5.
