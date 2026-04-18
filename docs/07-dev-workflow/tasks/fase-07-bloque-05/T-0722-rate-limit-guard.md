# T-0722 - Rate limiting en endpoints de autenticación

## Metadatos
- ID: `T-0722`
- Fase: `Fase 7`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Implementar rate limiting en memoria para los endpoints de autenticación sin depender de paquetes externos como @nestjs/throttler.

## Alcance
- Crear `apps/api/src/common/decorators/rate-limit.decorator.ts`:
  - `@RateLimit({ limit, windowMs })` — decorador que setea metadata.
- Crear `apps/api/src/common/guards/rate-limit.guard.ts`:
  - `RateLimitGuard` implementa `CanActivate`.
  - Bucket in-memory keyed por `${method}:${path}:${ip}`.
  - Ventana fija (no sliding): reset en `resetAt = now + windowMs`.
  - Lanza `HttpException(429)` al superar límite.
  - `setInterval` cada 5 min para pruning de buckets expirados.
- Registrar `RateLimitGuard` como `APP_GUARD` en `app.module.ts`.
- Aplicar en `apps/api/src/modules/auth/auth.controller.ts`:
  - `POST /v1/auth/login` → `@RateLimit({ limit: 10, windowMs: 60_000 })`
  - `POST /v1/auth/refresh` → `@RateLimit({ limit: 20, windowMs: 60_000 })`

## Resultados
- Más de 10 POSTs a /v1/auth/login desde la misma IP en 60 s retorna 429.
- Más de 20 POSTs a /v1/auth/refresh desde la misma IP en 60 s retorna 429.

## Criterios de aceptacion
- [x] RateLimitGuard implementado sin dependencias externas.
- [x] Decorador @RateLimit disponible para cualquier endpoint.
- [x] Registrado como APP_GUARD.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Rate limiting distribuido con Redis (válido solo para instancia única).
- Sliding window (ventana fija es suficiente para esta fase).

## Dependencias
- Ninguna nueva (no requiere paquetes externos).

## Notas técnicas
- Para multi-instancia en producción: reemplazar Map interno por Redis con INCR + EXPIRE.
