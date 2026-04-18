# Tablero de bloque — Fase 6 Bloque 8 (T-0635 a T-0639)

## Estado general: CERRADO ✅

| Task | Título | Estado |
|------|--------|--------|
| T-0635 | Configurar bitácora automática de acciones críticas | ✅ closed |
| T-0636 | Configurar módulo de sesiones/refresh tokens | ✅ closed |
| T-0637 | Configurar login/logout/refresh flow | ✅ closed |
| T-0638 | Configurar endpoint de perfil actual | ✅ closed |
| T-0639 | Configurar endpoints base de roles/permisos | ✅ closed |

## Validaciones de cierre
- `lint` ✅
- `typecheck` ✅
- `build` ✅

## Archivos creados/modificados
- `apps/api/src/modules/audit/audit.service.ts` — `auditAction()` + `AuditActionInput`
- `apps/api/src/modules/sessions/sessions.service.ts` — nuevo
- `apps/api/src/modules/sessions/sessions.module.ts` — nuevo
- `apps/api/src/modules/auth/auth.service.ts` — `logout()`, `refresh()`, `getProfile()`, `SessionsModule` import
- `apps/api/src/modules/auth/auth.module.ts` — importa `SessionsModule`
- `apps/api/src/modules/auth/auth.controller.ts` — endpoints `me`, `logout`, `refresh`
- `apps/api/src/modules/auth/dto/logout.dto.ts` — nuevo
- `apps/api/src/modules/auth/dto/refresh-token.dto.ts` — nuevo
- `apps/api/src/modules/roles/roles.service.ts` — `findPermissionsByRoleId()`
- `apps/api/src/modules/roles/roles.controller.ts` — `GET :id/permissions`
- `apps/api/src/modules/app/app.module.ts` — registra `SessionsModule`

## Pendientes cerrados en este bloque
- T-0618: Emisión automática de auditoría → resuelto con `auditAction()` en T-0635.
- T-0622: Verificación JWT → resuelto con scope Fase 7 (infraestructura sesiones lista).
- T-0623: Permisos desde identidad real → resuelto con scope Fase 7.
- T-0624: Decorators masivos → parcialmente resuelto en T-0639 (base de permisos por rol).
