# Estado de Ejecución - Fase 6 / Bloque 5

## Contexto
- Fecha de cierre de bloque: **2026-04-13**
- Fase 6: Backend foundation

## Estado del bloque
- Bloque `T-0620` a `T-0624`: **CERRADO**
- Estado global de Fase 6: **EN CURSO**

## Estado por task

| ID | Título | Estado | Evidencia |
|---|---|---|---|
| T-0620 | Configurar módulo Notifications base | Cerrada | `docs/07-dev-workflow/tasks/fase-06-bloque-05/T-0620-modulo-notifications-base.md` |
| T-0621 | Configurar módulo Sync base | Cerrada | `docs/07-dev-workflow/tasks/fase-06-bloque-05/T-0621-modulo-sync-base.md` |
| T-0622 | Configurar guards de autenticación | Cerrada | `docs/07-dev-workflow/tasks/fase-06-bloque-05/T-0622-guards-autenticacion.md` |
| T-0623 | Configurar guards de autorización | Cerrada | `docs/07-dev-workflow/tasks/fase-06-bloque-05/T-0623-guards-autorizacion.md` |
| T-0624 | Configurar decorators de permisos | Cerrada | `docs/07-dev-workflow/tasks/fase-06-bloque-05/T-0624-decorators-permisos.md` |

## Evidencia técnica consolidada

### Archivos creados (backend)
- `apps/api/src/modules/notifications/*`
- `apps/api/src/modules/sync/*`
- `apps/api/src/common/constants/auth.constants.ts`
- `apps/api/src/common/constants/authorization.constants.ts`
- `apps/api/src/common/decorators/public.decorator.ts`
- `apps/api/src/common/decorators/permissions.decorator.ts`
- `apps/api/src/common/guards/jwt-auth.guard.ts`
- `apps/api/src/common/guards/permissions.guard.ts`
- `apps/api/src/common/guards/roles.guard.ts`

### Archivos modificados
- `apps/api/src/modules/app/app.module.ts` — integración de módulos y guards globales.
- `apps/api/src/modules/app/app.controller.ts` — `@Public()`.
- `apps/api/src/modules/health/health.controller.ts` — `@Public()`.
- `apps/api/src/modules/auth/auth.controller.ts` — `@Public()` en rutas de auth base.

### Validaciones ejecutadas (por task)
- `pnpm.cmd --filter @atlasrep/api run lint` ✅
- `pnpm.cmd --filter @atlasrep/api run typecheck` ✅
- `pnpm.cmd --filter @atlasrep/api run build` ✅

## Riesgos residuales
- La validación JWT actual es de formato `Bearer` únicamente; firma y claims se cierran en `T-0636` y `T-0637`.
- Los decorators de permisos se definieron, pero su aplicación masiva por endpoint se ejecuta en bloques siguientes.

## Pendientes del siguiente bloque
- Iniciar `T-0625` a `T-0629` (decorators de organización/sucursal, utilidades comunes, convenciones DTO, paginación y filtros base).
