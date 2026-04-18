# Task Block 86 Status - Fase 10 Bloque 9

## Identificación
- Bloque: `Bloque 9`
- Fase: `Fase 10`
- Tasks: `T-1040` a `T-1044`
- Estado: `CERRADO`
- Fecha de cierre: `2026-04-13`

## Tasks del bloque

| Task | Título | Estado |
|------|--------|--------|
| T-1040 | Implementar auditoría de resolución de conflictos | CERRADA |
| T-1041 | Implementar pruebas E2E de sync online->offline->online | CERRADA |
| T-1042 | Implementar pruebas de conflictos de edición | CERRADA |
| T-1043 | Implementar pruebas de duplicados | CERRADA |
| T-1044 | Implementar pruebas de rechazo por regla de negocio | CERRADA |

## Entregables

### Backend Sync (auditoría + trazabilidad)
- [sync.service.ts](D:/RacoonDevs/AtlasERP/apps/api/src/modules/sync/sync.service.ts)
  - `ResolveConflictInput` ahora permite `source`.
  - Resolución manual registra `CONFLICT_RESOLVED_MANUAL` en `sync_logs`.
  - `auditAction` usa origen real (`WEB` o `DESKTOP`) y metadata ampliada.
- [sync.controller.ts](D:/RacoonDevs/AtlasERP/apps/api/src/modules/sync/sync.controller.ts)
  - Detecta origen de cliente desde headers y lo pasa al servicio.
- [sync-resolution-source.ts](D:/RacoonDevs/AtlasERP/apps/api/src/modules/sync/sync-resolution-source.ts) (nuevo)
  - Helper puro para resolver origen de cliente (`x-atlas-client` / `x-client-source`).

### Desktop Sync
- [syncConflictApi.js](D:/RacoonDevs/AtlasERP/apps/desktop/src/modules/sync/syncConflictApi.js)
  - Envía `x-atlas-client: desktop` al cerrar conflictos en backend.
- [syncWorker.js](D:/RacoonDevs/AtlasERP/apps/desktop/src/modules/sync/syncWorker.js)
  - Helpers puros para pruebas:
    - `evaluateSyncPreconditions`
    - `summarizeBatchResults`

### Pruebas implementadas
- [sync-resolution-source.test.ts](D:/RacoonDevs/AtlasERP/apps/api/src/modules/sync/sync-resolution-source.test.ts)
  - Cobertura de origen desktop/web.
- [sync.service.test.ts](D:/RacoonDevs/AtlasERP/apps/api/src/modules/sync/sync.service.test.ts)
  - Cobertura de conflictos de edición, duplicados y reglas de negocio.
- [syncWorker.test.js](D:/RacoonDevs/AtlasERP/apps/desktop/src/modules/sync/syncWorker.test.js)
  - Cobertura de transición online->offline->online y bloqueo por sync en progreso.

### Scripts de pruebas
- [apps/api/package.json](D:/RacoonDevs/AtlasERP/apps/api/package.json)
  - `test:sync-core` agregado (`tsx --test src/modules/sync/*.test.ts`)
- [apps/desktop/package.json](D:/RacoonDevs/AtlasERP/apps/desktop/package.json)
  - `test:sync-core` agregado (`node --test src/modules/sync/*.test.js`)

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`: OK
- `pnpm.cmd --filter @atlasrep/api run typecheck`: OK
- `pnpm.cmd --filter @atlasrep/api run build`: OK
- `pnpm.cmd --filter @atlasrep/api run test:sync-core`: OK (8 tests)
- `pnpm.cmd --filter @atlasrep/desktop run lint`: OK
- `pnpm.cmd --filter @atlasrep/desktop run build:web`: OK (57 módulos)
- `pnpm.cmd --filter @atlasrep/desktop run test:sync-core`: OK (3 tests)
