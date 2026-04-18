# T-0406 - Configurar contenedor de Redis

## Metadatos
- ID: `T-0406`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Documentar y materializar la configuracion completa del contenedor de Redis: imagen, autenticacion por ambiente, persistencia, healthcheck y red interna.

## Criterios de aceptacion
- [x] Imagen `redis:7-alpine` — version LTS fijada, footprint minimo.
- [x] Dev: sin autenticacion (facilita desarrollo local), puerto 6379 expuesto al host.
- [x] Staging/Prod: autenticacion via `--requirepass ${REDIS_PASSWORD}`, sin puerto expuesto.
- [x] Prod: `--appendonly yes` para persistencia de datos en disco.
- [x] Volumen nombrado `redis_data` para persistencia entre reinicios.
- [x] Healthcheck diferenciado por ambiente (con/sin password).
- [x] Red interna `atlasrep-internal` en staging/prod.
- [x] Apps conectan a Redis por nombre de servicio `redis`, no por `localhost`.

## Archivos modificados
- Configuracion ya materializada en los tres docker-compose files (dev, staging, prod).

## Configuracion por ambiente

### Desarrollo (`docker-compose.dev.yml`)
```yaml
redis:
  image: redis:7-alpine
  restart: unless-stopped
  ports:
    - "6379:6379"       # expuesto al host para herramientas locales
  volumes:
    - redis_data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
```
- Sin password: facilita desarrollo local (redis-cli, RedisInsight).
- Puerto expuesto: acceso directo desde el host.

### Staging (`docker-compose.staging.yml`)
```yaml
redis:
  image: redis:7-alpine
  restart: unless-stopped
  command: redis-server --requirepass ${REDIS_PASSWORD}
  # sin ports — solo accesible por red interna
  healthcheck:
    test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
```
- Con password: `REDIS_PASSWORD` inyectado por CI/CD.
- Sin persistencia AOF: staging puede perder datos en restart (aceptable).

### Produccion (`docker-compose.prod.yml`)
```yaml
redis:
  image: redis:7-alpine
  restart: always
  command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
  healthcheck:
    test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"
```
- `--appendonly yes`: persistencia AOF — Redis puede recuperar estado tras restart.
- `restart: always`: reinicio automatico ante fallos.
- Logging limitado para control de espacio en disco.

## Uso de Redis en AtlasERP

| Uso                    | Descripcion                                      |
| ---------------------- | ------------------------------------------------ |
| Cache de sesiones      | JWT invalidation, tokens de refresh              |
| Cola de jobs (BullMQ)  | Jobs del worker (reportes, emails, sync events)  |
| Cache de consultas     | Resultados de consultas pesadas de PostgreSQL    |
| Rate limiting          | Throttle de endpoints criticos de la API         |

## Conexion desde las apps
```
# En NestJS (api y worker)
REDIS_HOST=redis       # nombre del servicio Docker
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}
```
- En dev el host es `localhost` (o `redis` si corre dentro de Docker).
- En staging/prod el host SIEMPRE es `redis` (nombre del servicio en la red interna).

## Decisiones tecnicas
- **Redis 7**: soporte nativo de Functions, ACLs mejoradas, mejor rendimiento vs Redis 6.
- **Alpine**: imagen minima, menor superficie de ataque.
- **AOF solo en prod**: staging no necesita durabilidad; simplifica reinicios de entorno.
- **Sin RDB snapshot en esta fase**: se puede habilitar en Fase 5 si se necesita backup de Redis.

## Pendientes no resueltos
- Configuracion de BullMQ y queues — se implementa en Fase 5 (modulo worker).
- ACLs de Redis (usuarios con permisos minimos) — mejora de seguridad post-MVP.
