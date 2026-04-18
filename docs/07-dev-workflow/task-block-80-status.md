# Task Block 80 Status — Fase 10 Bloque 4

## Identificacion
- Bloque: `Bloque 4`
- Fase: `Fase 10`
- Tasks: `T-1015` a `T-1019`
- Estado: `CERRADO`
- Fecha de cierre: `2026-04-13`

## Tasks del bloque

| Task | Titulo | Estado |
|------|--------|--------|
| T-1015 | Implementar servicio local de dequeue controlado | CERRADA |
| T-1016 | Implementar worker local de sincronizacion | CERRADA |
| T-1017 | Implementar endpoints backend de sync batch | CERRADA |
| T-1018 | Implementar validacion backend de sync items | CERRADA |
| T-1019 | Implementar persistencia backend de SyncSession | CERRADA |

## Entregables

### Desktop (JS)
- `src/bridge/syncItems.bridge.js` — nuevas funciones: syncItemListReady, syncItemMarkProcessing, syncItemMarkDone, syncItemMarkFailed
- `src/modules/sync/localSyncItemsRepository.js` — wrappers: listReadySyncItems, markSyncItemProcessing, markSyncItemDone, markSyncItemFailed
- `src/modules/sync/localSyncDequeueService.js` — dequeueReadyItems(), rollbackStaleProcessingItems()
- `src/modules/sync/syncWorker.js` — runSyncCycle(), getSyncWorkerStatus()

### Desktop (Rust)
- `commands.rs` — sync_item_list_ready, sync_item_mark_processing, sync_item_mark_done (con session_ref), sync_item_mark_failed (con backoff exponencial)
- `lib.rs` — registrado los 4 nuevos comandos

### Backend
- `dto/sync-batch-item.dto.ts` — SyncBatchItemDto con whitelist de entity/operation
- `dto/sync-batch-request.dto.ts` — SyncBatchRequestDto (1-100 items)
- `sync.service.ts` — processBatch() + processSingleItem() con idempotencia
- `sync.controller.ts` — POST /v1/sync/batch

## Validaciones
- pnpm --filter api lint: OK
- pnpm --filter api typecheck: OK
- pnpm --filter @atlasrep/desktop run lint: OK
- pnpm --filter @atlasrep/desktop run build:web: OK
- pnpm --filter @atlasrep/desktop run test:shell-smoke: OK
