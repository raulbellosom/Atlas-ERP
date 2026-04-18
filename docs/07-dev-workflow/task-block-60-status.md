# task-block-60 — Fase 7 Bloque 4: Auditoria de datos, login/logout, sync, conflictos y paginacion

## Estado: CERRADO

## Tasks del bloque
| Task | Titulo | Estado |
|------|--------|--------|
| T-0715 | Implementar auditoria de cambios de datos | closed |
| T-0716 | Implementar auditoria de login/logout | closed |
| T-0717 | Implementar auditoria de sync actions | closed |
| T-0718 | Implementar auditoria de resoluciones de conflicto | closed |
| T-0719 | Implementar consulta paginada de auditoria | closed |

## Resumen de implementacion

### Archivos modificados
- `apps/api/src/modules/users/users.service.ts` — lockUser, unlockUser, activateUser, deactivateUser ahora incluyen auditAction con before/after
- `apps/api/src/modules/users/users.controller.ts` — pasa actorId a los metodos de usuarios
- `apps/api/src/modules/users/users.module.ts` — importa AuditModule
- `apps/api/src/modules/auth/auth.service.ts` — login() genera USER_LOGIN audit; logout() genera USER_LOGOUT audit; inyecta AuditService
- `apps/api/src/modules/auth/auth.module.ts` — importa AuditModule
- `apps/api/src/modules/sync/sync.service.ts` — resolveConflict() con CONFLICT_RESOLVED audit + ConflictResolution DB record
- `apps/api/src/modules/sync/sync.controller.ts` — agrega PATCH /v1/sync/conflicts/:id/resolve
- `apps/api/src/modules/sync/sync.module.ts` — importa AuditModule
- `apps/api/src/modules/audit/audit.service.ts` — findAll() ahora retorna PaginatedResult con items + pagination
- `apps/api/src/modules/audit/dto/list-audit-logs.query.dto.ts` — agrega page field para paginacion

### Nuevos archivos
- `apps/api/src/modules/sync/dto/resolve-conflict.dto.ts` — ResolveConflictDto con action y reason

### Entradas de auditoria generadas
- `USER_LOGIN` — en cada login exitoso, con sessionId y metadata de ip/userAgent
- `USER_LOGOUT` — en cada logout (session individual o todas las sesiones)
- `USER_LOCKED` / `USER_UNLOCKED` — con before/after del estado isLocked
- `USER_ACTIVATED` / `USER_DEACTIVATED` — con before/after del estado isActive
- `CONFLICT_RESOLVED` — cuando un conflicto se resuelve via PATCH /v1/sync/conflicts/:id/resolve
- `HTTP_POST` / `HTTP_DELETE` etc — via RequestAuditInterceptor (T-0714)

### Paginacion de auditoria
- GET /v1/audit/logs acepta page y limit (1-100)
- Retorna {items: [...], pagination: {page, limit, total, totalPages}}
- Ordenado por createdAt desc, id desc

## Smoke test Bloque 4
- Login → USER_LOGIN audit entry con result: SUCCESS ✅
- GET /v1/audit/logs?limit=5 → pagination: {page:1, limit:5, total:3, totalPages:1} ✅
- POST /v1/users/:id/lock → USER_LOCKED audit con before:{isLocked:false}, after:{isLocked:true} ✅
- GET /v1/audit/logs/:id → detail con before/after fields ✅

## Validaciones
- `lint` ✅
- `typecheck` ✅
- `build` ✅
- smoke test ✅

## Fecha de cierre
2026-04-13
