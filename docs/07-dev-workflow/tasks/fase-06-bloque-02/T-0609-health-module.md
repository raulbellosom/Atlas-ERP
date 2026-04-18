# T-0609 - Configurar health module

## Metadatos
- ID: `T-0609`
- Fase: `Fase 6`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Crear el modulo dedicado de health check de la API, con un endpoint `GET /api/health` que responde con estado, timestamp y uptime del proceso.

## Criterios de aceptacion
- [x] `HealthModule` creado en `apps/api/src/modules/health/`.
- [x] `HealthController` con `GET /api/health` → `{ status, timestamp, uptime }`.
- [x] `HealthModule` importado en `AppModule`.
- [x] Endpoint de health eliminado de `AppController` y `AppService` (consolidado en HealthModule).
- [x] lint ✅ · typecheck ✅ · build ✅
- [x] Smoke test ✅:
  - `GET /api/health` → `{ data: { status: 'ok', timestamp, uptime }, meta: { timestamp } }`
  - `GET /api` → `{ data: { name, status, version }, meta: { timestamp } }` (TransformInterceptor activo)
  - `GET /api/nonexistent` → `{ statusCode: 404, ... }` (AllExceptionsFilter activo)

## Archivos creados
- `apps/api/src/modules/health/health.controller.ts`
- `apps/api/src/modules/health/health.module.ts`

## Archivos modificados
- `apps/api/src/modules/app/app.module.ts` — importa `HealthModule`
- `apps/api/src/modules/app/app.controller.ts` — eliminado `GET health` (movido a HealthModule)
- `apps/api/src/modules/app/app.service.ts` — eliminado `getHealth()` (movido a HealthModule)

## Respuesta del endpoint

```
GET /api/health
→ 200 OK
{
  "data": {
    "status": "ok",
    "timestamp": "2026-04-13T14:13:13.196Z",
    "uptime": 8
  },
  "meta": {
    "timestamp": "2026-04-13T14:13:13.196Z"
  }
}
```

## Campos de la respuesta

| Campo       | Tipo   | Descripcion                                      |
| ----------- | ------ | ------------------------------------------------ |
| `status`    | string | Siempre `"ok"` mientras el proceso esta corriendo |
| `timestamp` | string | ISO 8601 del momento de la peticion              |
| `uptime`    | number | Segundos desde que arranco el proceso Node.js    |

## Uso por Docker
El docker-compose.staging.yml y prod.yml configuran:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
```
Este endpoint responde 200 OK mientras el proceso este activo — suficiente para el healthcheck de Docker.

## Pendientes no resueltos
- Checks de conectividad a BD y Redis en el healthcheck (`/api/health/detailed`) — Fase 7+ con `@nestjs/terminus`.
- Metricas de Prometheus en `/api/metrics` — Fase 6+.
