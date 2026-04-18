# T-0642 - Configurar endpoints base de auditoría

## Metadatos
- ID: `T-0642`
- Fase: `Fase 6`
- Bloque: `Bloque 9`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Verificar que `AuditModule` tiene los endpoints base y el método `auditAction()` completos.

## Alcance
- `GET /v1/audit/logs` — listado filtrable (organizationId, actorId, action, entityType, entityId, source, limit).
- `GET /v1/audit/logs/:id` — detalle con campos before/after/metadata.
- `auditAction()` disponible para emisión interna desde otros servicios (cerrado en T-0635).

## Fuera de alcance
- Endpoints de escritura directa de auditoría desde HTTP — la escritura es solo interna vía `auditAction()`.

## Dependencias
- `T-0641` cerrada.

## Criterios de aceptación
- [x] Endpoints de audit verificados como operativos.
- [x] `AuditModule` exporta `AuditService` con `auditAction()`.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`
- `pnpm --filter @atlasrep/api run typecheck`
- `pnpm --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/audit/audit.controller.ts`
- `apps/api/src/modules/audit/audit.service.ts`
- `apps/api/src/modules/audit/audit.module.ts`

## Pendientes no resueltos
- Ninguno.
