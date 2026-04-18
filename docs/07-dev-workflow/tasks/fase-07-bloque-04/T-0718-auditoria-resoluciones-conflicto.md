# T-0718 - Implementar auditoria de resoluciones de conflicto

## Metadatos
- ID: `T-0718`
- Fase: `Fase 7`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Implementar endpoint de resolucion de conflictos de sincronizacion con audit logging y registro en ConflictResolution.

## Alcance
- Crear `apps/api/src/modules/sync/dto/resolve-conflict.dto.ts`:
  - `action: ConflictResolutionAction` (APPROVE_LOCAL, KEEP_SERVER, DISCARD_LOCAL, MERGE_MANUAL, AUTO_RESOLVED).
  - `reason?: string` (justificacion opcional).
- Actualizar `apps/api/src/modules/sync/sync.service.ts`:
  - Inyectar `AuditService`.
  - Agregar `resolveConflict(conflictId, input)`:
    - Actualiza `ConflictRecord.status = RESOLVED`, `resolution`, `resolvedById`, `resolvedAt`.
    - Crea registro en `ConflictResolution` con action, resolvedById, source=WEB.
    - Genera audit: action='CONFLICT_RESOLVED', before={status:OPEN}, after={status:RESOLVED, resolution}.
    - Lanza NotFoundException si el conflicto no existe.
- Actualizar `apps/api/src/modules/sync/sync.controller.ts`:
  - Agregar `PATCH /v1/sync/conflicts/:id/resolve` con `@Body() dto: ResolveConflictDto, @Req() req`.
- Actualizar `apps/api/src/modules/sync/sync.module.ts` — importa AuditModule.

## Resultados
- PATCH /v1/sync/conflicts/:id/resolve crea ConflictResolution en DB y genera CONFLICT_RESOLVED audit.
- Operacion atomica via $transaction.

## Criterios de aceptacion
- [x] resolveConflict actualiza ConflictRecord + crea ConflictResolution en una transaccion.
- [x] CONFLICT_RESOLVED en AuditLog con before/after del estado.
- [x] NotFoundException si conflicto no existe.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Resolucion automatica de conflictos por el sync engine.
- Validacion de permisos para resolver conflictos (requiere @RequireAllPermissions).

## Dependencias
- T-0714 cerrada (AuditService.auditAction).
- T-0701 cerrada (sesion del usuario disponible via req.user).

## Pendientes no resueltos
- Ninguno.
