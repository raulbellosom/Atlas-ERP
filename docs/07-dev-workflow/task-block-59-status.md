# task-block-59 — Fase 7 Bloque 3: Permisos granulares, scoping org/branch, auditoria de requests

## Estado: CERRADO

## Tasks del bloque
| Task | Titulo | Estado |
|------|--------|--------|
| T-0710 | Implementar permisos granulares por modulo | closed |
| T-0711 | Implementar permisos por accion | closed |
| T-0712 | Implementar scoping por organizacion | closed |
| T-0713 | Implementar scoping por sucursal | closed |
| T-0714 | Implementar middleware/auditoria de request | closed |

## Resumen de implementacion

### Nuevos archivos
- `apps/api/src/common/guards/scope.guard.ts` — ScopeGuard: enforces @RequireOrganizationScope() y @RequireBranchScope() (verifica que el recurso pertenece a la org/branch del usuario autenticado)
- `apps/api/src/common/interceptors/request-audit.interceptor.ts` — RequestAuditInterceptor: loguea mutaciones HTTP (POST/PUT/PATCH/DELETE) al AuditLog para usuarios autenticados

### Archivos modificados
- `apps/api/src/common/guards/permissions.guard.ts` — ahora async, carga permisos reales desde DB via PrismaService; resuelve cadena de ancestros de roles (herencia); cachea permisos en req.user.permissions
- `apps/api/src/modules/app/app.module.ts` — agrega ScopeGuard como APP_GUARD y RequestAuditInterceptor como APP_INTERCEPTOR

### Mecanismo de permisos DB-backed
1. El JWT payload tiene `sub`, `organizationId`, `branchId` (sin permisos inline)
2. Cuando un endpoint tiene @RequireAllPermissions o @RequireAnyPermission, PermissionsGuard:
   - Obtiene userId de req.user.sub
   - Consulta prisma.userRole para obtener roleIds del usuario
   - Resuelve cadena de padres (parentRoleId) para herencia jerarquica
   - Consulta prisma.rolePermission para obtener permission keys
   - Verifica contra los permisos requeridos
   - Cachea el resultado en req.user.permissions

### Mecanismo de scoping
- @RequireOrganizationScope() → ScopeGuard compara req.params.organizationId con req.user.organizationId
- @RequireBranchScope() → ScopeGuard compara req.params.branchId con req.user.branchId
- Sin el decorador → passthrough (comportamiento por defecto)

### Mecanismo de auditoria de requests
- RequestAuditInterceptor actua solo para metodos mutantes: POST, PUT, PATCH, DELETE
- Solo para usuarios autenticados (req.user.sub disponible)
- Logs @Public routes se omiten
- Registra: action=HTTP_{METHOD}, entityType=Request, entityId=path, result=statusCode, metadata={durationMs,...}
- Errores de auditoria se loguean via Logger pero no propagan al usuario

## Smoke test Bloque 3
- GET /v1/permissions (sin decoradores) → 200, 13 permisos ✅
- POST /v1/users/:id/lock → audit log generado con action: HTTP_POST ✅
- GET /v1/audit/logs → 1 entrada con HTTP_POST /api/v1/users/:id/lock, result: 201 ✅
- POST /v1/users/:id/unlock → isLocked: false ✅

## Validaciones
- `lint` ✅
- `typecheck` ✅
- `build` ✅
- smoke test ✅

## Fecha de cierre
2026-04-13
