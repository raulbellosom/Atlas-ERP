# T-0622 - Configurar guards de autenticación

## Metadatos
- ID: `T-0622`
- Fase: `Fase 6`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar guard base de autenticación para proteger endpoints por defecto y habilitar rutas públicas explícitas.

## Alcance
- Crear `JwtAuthGuard` en `common/guards`.
- Crear decorador `@Public()` y metadata key correspondiente.
- Registrar `JwtAuthGuard` como `APP_GUARD` global en `AppModule`.
- Marcar rutas públicas base:
  - `GET /api`
  - `GET /api/health`
  - `GET /api/v1/auth/status`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/register`

## Fuera de alcance
- Validación criptográfica JWT completa (firma/expiración/claims).
- Estrategias Passport y sesiones productivas.

## Dependencias
- `T-0621` cerrada.

## Criterios de aceptación
- [x] Guard de autenticación global activo.
- [x] Rutas públicas declaradas explícitamente con `@Public()`.
- [x] Endpoints no públicos requieren header `Authorization: Bearer <token>`.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/common/constants/auth.constants.ts`
- `apps/api/src/common/decorators/public.decorator.ts`
- `apps/api/src/common/guards/jwt-auth.guard.ts`
- `apps/api/src/modules/app/app.module.ts`
- `apps/api/src/modules/app/app.controller.ts`
- `apps/api/src/modules/health/health.controller.ts`
- `apps/api/src/modules/auth/auth.controller.ts`

## Pendientes no resueltos
- Integrar verificación JWT real (firma/claims/sesiones) en `T-0636` y `T-0637`.
