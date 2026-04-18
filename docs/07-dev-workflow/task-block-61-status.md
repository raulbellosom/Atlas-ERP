# Task Block 61 — Fase 7, Bloque 5

## Estado: COMPLETADO

| Task | Título | Estado |
|------|--------|--------|
| T-0720 | Filtros de fecha en consulta de auditoría | closed |
| T-0721 | Protección de endpoints sensibles con permisos | closed |
| T-0722 | Rate limiting en endpoints de autenticación | closed |
| T-0723 | Documentar validación de archivos subidos | closed |
| T-0724 | Trazabilidad de archivos subidos en auditoría | closed |

## Validaciones
- lint: OK
- typecheck: OK
- build: OK

## Archivos modificados
- `apps/api/src/modules/audit/audit.service.ts` — filtros from/to en findAll()
- `apps/api/src/modules/audit/dto/list-audit-logs.query.dto.ts` — campos from, to
- `apps/api/src/modules/audit/audit.controller.ts` — @RequireAllPermissions('audit:read')
- `apps/api/src/modules/users/users.controller.ts` — @RequireAllPermissions('auth:user:write') en 4 endpoints
- `apps/api/src/common/decorators/rate-limit.decorator.ts` — nuevo
- `apps/api/src/common/guards/rate-limit.guard.ts` — nuevo
- `apps/api/src/modules/app/app.module.ts` — RateLimitGuard como APP_GUARD
- `apps/api/src/modules/auth/auth.controller.ts` — @RateLimit en login y refresh
- `apps/api/src/modules/attachments/attachments.module.ts` — AuditModule importado
- `apps/api/src/modules/attachments/attachments.service.ts` — FILE_UPLOADED audit
