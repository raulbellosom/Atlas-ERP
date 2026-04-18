# T-0618 - Configurar módulo Audit

## Metadatos
- ID: `T-0618`
- Fase: `Fase 6`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar el módulo `Audit` con endpoints foundation de consulta de bitácora.

## Alcance
- Crear `AuditModule`, `AuditController`, `AuditService`.
- Crear `ListAuditLogsQueryDto`.
- Exponer rutas:
  - `GET /api/v1/audit/logs`
  - `GET /api/v1/audit/logs/:id`
- Soportar filtros base (`organizationId`, `actorId`, `action`, `entityType`, `entityId`, `source`, `limit`).

## Fuera de alcance
- Escritura automática de bitácora en todas las operaciones.
- Correlación de auditoría con request-id global.

## Dependencias
- `T-0617` cerrada.
- Modelo `AuditLog` disponible desde Fase 5.

## Criterios de aceptación
- [x] Módulo `audit` creado e importado.
- [x] Servicio Prisma con listado filtrable y detalle por `id`.
- [x] DTO validado para filtros de consulta.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/audit/audit.module.ts`
- `apps/api/src/modules/audit/audit.controller.ts`
- `apps/api/src/modules/audit/audit.service.ts`
- `apps/api/src/modules/audit/dto/list-audit-logs.query.dto.ts`
- `apps/api/src/modules/app/app.module.ts`

## Pendientes no resueltos
- Registrar auditoría automática de operaciones críticas en `T-0635`.
