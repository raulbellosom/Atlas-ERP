# T-0408 - Configurar contenedor del backend API

## Metadatos
- ID: `T-0408`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Documentar y materializar la configuracion completa del contenedor del servicio API de NestJS en staging y produccion: imagen, variables de entorno, healthcheck, dependencias y red interna.

## Criterios de aceptacion
- [x] Imagen versionada por tag: `atlasrep/api:${IMAGE_TAG:-latest}`.
- [x] Variables de entorno completas: DATABASE_URL, REDIS_*, S3_*, JWT_*, NODE_ENV, PORT.
- [x] `depends_on` con `condition: service_healthy` para postgres y redis.
- [x] Healthcheck: `GET /api/health` en `http://localhost:3000/api/health`.
- [x] `start_period: 60s` en prod — NestJS necesita tiempo para compilar y conectar.
- [x] Puerto 3000 interno — NO expuesto al host; nginx hace de reverse proxy.
- [x] Red interna `atlasrep-internal` — API no es accesible directamente desde internet.
- [x] `NODE_ENV: production` en staging y prod.

## Archivos modificados
- Configuracion ya materializada en docker-compose.staging.yml y docker-compose.prod.yml.

## Configuracion del contenedor

### Imagen
```yaml
image: atlasrep/api:${IMAGE_TAG:-latest}
```
- `IMAGE_TAG` se inyecta desde CI/CD (e.g., `sha-abc1234`, `v1.2.0`).
- Fallback a `latest` para compatibilidad, pero en prod siempre se debe fijar el tag.

### Variables de entorno
```yaml
environment:
  DATABASE_URL: ${DATABASE_URL}           # postgres://user:pass@postgres:5432/db
  REDIS_HOST: redis                       # nombre del servicio Docker
  REDIS_PORT: 6379
  REDIS_PASSWORD: ${REDIS_PASSWORD}
  S3_ENDPOINT: http://minio:9000          # nombre del servicio Docker
  S3_ACCESS_KEY: ${S3_ACCESS_KEY}
  S3_SECRET_KEY: ${S3_SECRET_KEY}
  S3_BUCKET: ${S3_BUCKET}
  JWT_SECRET: ${JWT_SECRET}
  JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-7d}   # default 7 dias
  NODE_ENV: production
  PORT: 3000
```

### Healthcheck
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 60s
```
- El endpoint `/api/health` debe responder `200 OK`.
- Se implementa en Fase 5 en el modulo de NestJS.
- nginx solo arranca cuando `api` esta sana (`depends_on: condition: service_healthy`).

### Red y puertos
```yaml
networks:
  - atlasrep-internal
# sin "ports:" — nginx hace de proxy
```
- Puerto 3000 solo accesible desde dentro de la red Docker.
- nginx redirige `GET /api/*` → `http://api:3000`.

## Flujo de arranque de servicios
```
postgres (healthy) ─┐
                    ├─► api (healthy) ─► nginx (started)
redis (healthy) ────┘
                    └─► worker (started)
```

## Endpoint de health requerido
La Fase 5 debe implementar en NestJS:
```
GET /api/health
→ 200 OK { status: "ok", timestamp: "...", uptime: 123 }
```
El prefijo `api` viene de `app.setGlobalPrefix('api')` en `apps/api/src/main.ts`.

## Validacion de env vars
Las variables de entorno son validadas al arrancar NestJS via `apps/api/src/config/env.validation.ts`.
Si falta alguna variable requerida, el proceso falla con error claro antes de levantar el servidor.

## Decisiones tecnicas
- **Sin hot-reload en contenedor**: el contenedor corre `node dist/main.js` (build de produccion), no `nest start --watch`.
- **Puerto interno 3000**: no se expone al host para forzar todo el trafico a pasar por nginx (SSL termination, rate limiting, headers de seguridad).
- **`depends_on` con healthcheck**: garantiza que la BD y Redis esten listos antes de que NestJS intente conectar.

## Pendientes no resueltos
- Dockerfile de la API — se crea en T-0415.
- Endpoint `GET /api/health` — se implementa en Fase 5.
- Configuracion de Prisma migrations al arrancar contenedor — se decide en Fase 5.
