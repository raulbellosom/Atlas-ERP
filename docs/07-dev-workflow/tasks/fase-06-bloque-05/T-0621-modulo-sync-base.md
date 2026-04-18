# T-0621 - Configurar módulo Sync base

## Metadatos
- ID: `T-0621`
- Fase: `Fase 6`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar `SyncModule` base para consultas foundation de sesiones de sincronización y conflictos abiertos.

## Alcance
- Crear `SyncModule`, `SyncController`, `SyncService`.
- Crear `ListSyncSessionsQueryDto`.
- Exponer rutas:
  - `GET /api/v1/sync/sessions`
  - `GET /api/v1/sync/sessions/:id`
  - `GET /api/v1/sync/conflicts/open`
  - `GET /api/v1/sync/summary`
- Integrar módulo en `AppModule`.

## Fuera de alcance
- Motor de sincronización activo (aplicación de items/reintentos).
- Resolución automática de conflictos.

## Dependencias
- `T-0620` cerrada.
- Modelos `SyncSession` y `ConflictRecord` disponibles desde Fase 5.

## Criterios de aceptación
- [x] Módulo `sync` creado e importado.
- [x] Servicio Prisma con consultas de sesiones, conflictos y resumen.
- [x] DTO con filtros base (`organizationId`, `deviceRegistryId`, `status`, `limit`).
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/sync/sync.module.ts`
- `apps/api/src/modules/sync/sync.controller.ts`
- `apps/api/src/modules/sync/sync.service.ts`
- `apps/api/src/modules/sync/dto/list-sync-sessions.query.dto.ts`
- `apps/api/src/modules/app/app.module.ts`

## Pendientes no resueltos
- Implementación del flujo completo de sync en fases posteriores (`T-0700+`).
