# T-0715 - Implementar auditoria de cambios de datos

## Metadatos
- ID: `T-0715`
- Fase: `Fase 7`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Registrar cambios de datos relevantes en el AuditLog con los valores `before` y `after`, para trazabilidad completa de mutaciones sobre entidades criticas.

## Alcance
- Actualizar `apps/api/src/modules/users/users.service.ts`:
  - Inyectar `AuditService`.
  - `lockUser()`: lookup estado actual → auditAction({action:'USER_LOCKED', before:{isLocked:prev}, after:{isLocked:true}}).
  - `unlockUser()`: auditAction({action:'USER_UNLOCKED', before:{isLocked:prev}, after:{isLocked:false}}).
  - `activateUser()`: auditAction({action:'USER_ACTIVATED', before:{isActive:prev}, after:{isActive:true}}).
  - `deactivateUser()`: auditAction({action:'USER_DEACTIVATED', before:{isActive:prev}, after:{isActive:false}}).
- Actualizar `apps/api/src/modules/users/users.module.ts` — importa AuditModule.
- Los campos `before` y `after` se almacenan como JSON en AuditLog.before/after.

## Resultados
- Cada operacion de lock/unlock/activate/deactivate genera entrada en AuditLog con before/after.
- GET /v1/audit/logs/:id retorna before y after correctamente.
- before:{isLocked:false}, after:{isLocked:true} verificado en smoke test.

## Criterios de aceptacion
- [x] lockUser genera USER_LOCKED con before/after.
- [x] unlockUser genera USER_UNLOCKED con before/after.
- [x] activateUser genera USER_ACTIVATED con before/after.
- [x] deactivateUser genera USER_DEACTIVATED con before/after.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Auditoria de cambios en roles, permisos, organizaciones (Fase posterior).

## Dependencias
- T-0714 cerrada (AuditService.auditAction disponible).

## Pendientes no resueltos
- Ninguno.
