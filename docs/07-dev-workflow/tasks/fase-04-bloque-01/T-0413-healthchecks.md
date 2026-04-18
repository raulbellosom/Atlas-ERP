# T-0413 - Configurar healthchecks básicos

## Metadatos
- ID: `T-0413`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Documentar y materializar los healthchecks de todos los servicios Docker de AtlasERP: comandos de verificacion, intervalos, umbrales y como se usan para orquestar el arranque de servicios dependientes.

## Criterios de aceptacion
- [x] Healthcheck configurado en todos los servicios de infra (postgres, redis, minio).
- [x] Healthcheck configurado en el servicio api.
- [x] Worker sin healthcheck (proceso de cola — no tiene endpoint HTTP).
- [x] Web con `condition: service_started` (nginx de estaticos — no necesita health propio).
- [x] Parametros diferenciados por ambiente (start_period solo en prod).
- [x] `depends_on` con `condition: service_healthy` para garantizar orden de arranque.

## Archivos modificados
- Healthchecks ya configurados en los tres docker-compose files.

## Healthchecks por servicio

### PostgreSQL
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
  interval: 10s
  timeout: 5s
  retries: 10       # hasta 100s de espera
  start_period: 30s # solo en prod
```
- `pg_isready`: comando nativo de PostgreSQL, verifica que el server acepta conexiones.
- `retries: 10` con `interval: 10s` = hasta 100 segundos para considerarlo unhealthy.
- `start_period: 30s` en prod: permite que PostgreSQL inicialice el volumen en primer arranque.

### Redis
```yaml
# Dev (sin password):
healthcheck:
  test: ["CMD", "redis-cli", "ping"]

# Staging/Prod (con password):
healthcheck:
  test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
  interval: 10s
  timeout: 5s
  retries: 10
```
- `redis-cli ping` devuelve `PONG` si el servidor esta listo.
- En staging/prod el flag `-a` pasa el password requerido por `--requirepass`.

### MinIO
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
  interval: 30s
  timeout: 20s
  retries: 5
  start_period: 30s # solo en prod
```
- Endpoint HTTP oficial de MinIO para liveness.
- `timeout: 20s` largo porque MinIO puede tardar en inicializar el almacenamiento.
- `interval: 30s`: MinIO no necesita verificacion tan frecuente como postgres/redis.

### API (NestJS)
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 60s # NestJS necesita tiempo para arrancar
```
- Endpoint implementado en Fase 5: `GET /api/health → 200 OK`.
- `start_period: 60s`: NestJS necesita tiempo para compilar modulos y conectar a BD.
- nginx depende de `api: condition: service_healthy` — no arranca hasta que la API este sana.

### Worker
```yaml
# Sin healthcheck
```
- El worker es un consumer de cola (BullMQ), no un servidor HTTP.
- Docker no puede verificar su salud via HTTP.
- La supervision se hace via logs y metricas de BullMQ en Fase 5+.

### Web
```yaml
# Sin healthcheck — nginx depende de "web: condition: service_started"
```
- El contenedor `web` sirve archivos estaticos via nginx interno.
- No requiere un healthcheck de aplicacion; `service_started` es suficiente.

## Parametros de healthcheck

| Parametro      | Significado                                          |
| -------------- | ---------------------------------------------------- |
| `interval`     | Tiempo entre verificaciones                          |
| `timeout`      | Tiempo maximo para que el comando responda           |
| `retries`      | Intentos fallidos antes de declarar unhealthy        |
| `start_period` | Tiempo de gracia al inicio — fallos no cuentan como retries |

**Formula para timeout total de arranque:**
```
tiempo_max = start_period + (interval * retries)
```
Para api en prod: `60 + (30 * 5) = 210 segundos` = 3.5 minutos de tolerancia.

## Flujo de orquestacion

```
postgres ──healthy──►┐
                     ├──► api ──healthy──► nginx ──started
redis ────healthy──►─┤
                     └──► worker ──started
minio ────healthy──►─┘ (api y worker lo usan pero no hay depends_on directo)
```

**Nota**: api y worker no tienen `depends_on: minio` con `service_healthy` porque:
1. MinIO puede no tener datos aun (bucket vacio es estado valido).
2. El cliente S3 en NestJS tiene reintentos propios si MinIO no esta listo.
3. Simplifica el grafo de dependencias.

## Pendientes no resueltos
- Endpoint `GET /api/health` — se implementa en Fase 5 (modulo HealthModule de NestJS).
- Metricas de healthcheck (Prometheus/Grafana) — Fase 6+.
