# T-0626 - Configurar utilidades comunes

## Metadatos
- ID: `T-0626`
- Fase: `Fase 6`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar utilidades comunes reutilizables para normalización de headers y números en backend foundation.

## Alcance
- Crear utilidades HTTP:
  - `getSingleHeaderValue(headers, key)`
  - `getCsvHeaderValues(headers, key)`
- Crear utilidades numéricas:
  - `clampNumber(value, min, max)`
  - `normalizePositiveInt(value, fallback, min, max)`
- Integrar utilidades en componentes existentes:
  - `PermissionsGuard`
  - `RolesGuard`
  - decorators de scope

## Fuera de alcance
- Librería completa de utilidades cross-domain.
- Normalización avanzada de payloads de negocio.

## Dependencias
- `T-0625` cerrada.

## Criterios de aceptación
- [x] Utilidades comunes creadas en `common/utils`.
- [x] Adopción real en guards/decorators existentes (sin código muerto).
- [x] Validaciones estáticas sin regresiones.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/common/utils/http-request.util.ts`
- `apps/api/src/common/utils/number.util.ts`
- `apps/api/src/common/guards/permissions.guard.ts`
- `apps/api/src/common/guards/roles.guard.ts`
- `apps/api/src/common/decorators/scope.decorator.ts`

## Pendientes no resueltos
- Extender utilidades de request context al flujo de sesión/JWT productivo.
