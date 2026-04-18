# T-0635 - Configurar bitácora automática de acciones críticas

## Metadatos
- ID: `T-0635`
- Fase: `Fase 6`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Agregar método `auditAction()` al `AuditService` para que cualquier servicio pueda emitir entradas de auditoría para operaciones críticas, resolviendo el pendiente diferido de `T-0618`.

## Alcance
- Definir interfaz `AuditActionInput` con campos: `organizationId`, `actorId?`, `action`, `entityType`, `entityId`, `origin` (SourceType), `result?`, `before?`, `after?`, `metadata?`.
- Implementar `auditAction(input: AuditActionInput): Promise<void>` en `AuditService`.
- Persistencia directa vía `prisma.auditLog.create()`.
- Manejar campos JSON opcionales con `Prisma.JsonNull` cuando no se proporcionan.

## Fuera de alcance
- Wiring automático en interceptor global (se hace por llamada explícita desde cada servicio).
- Truncado/compresión de payloads before/after.

## Dependencias
- `T-0634` cerrada (Bloque 7 completo).

## Criterios de aceptación
- [x] Interfaz `AuditActionInput` exportada desde `audit.service.ts`.
- [x] Método `auditAction()` implementado y tipado correctamente.
- [x] `AuditModule` exporta `AuditService` para uso por otros módulos.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`
- `pnpm --filter @atlasrep/api run typecheck`
- `pnpm --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/audit/audit.service.ts`
- `apps/api/src/modules/audit/audit.module.ts`

## Pendientes no resueltos
- Ninguno. Pendiente T-0618 resuelto.
