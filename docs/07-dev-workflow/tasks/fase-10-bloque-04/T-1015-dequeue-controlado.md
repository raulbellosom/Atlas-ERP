# T-1015 - Implementar servicio local de dequeue controlado

## Metadatos
- ID: `T-1015`
- Fase: `Fase 10`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance

### Rust (commands.rs + lib.rs)
- `sync_item_list_ready(limit?)`: SELECT pending+approved items ordenados por prioridad.
- `sync_item_mark_processing(id)`: UPDATE → status='processing', attempts+1. Solo si pending+approved.
- `sync_item_mark_done(id, session_ref?)`: UPDATE → status='done', last_error=NULL.
- `sync_item_mark_failed(id, last_error?)`: UPDATE → status='failed', retry_at con backoff exponencial (min(30*2^(attempts-1), 3600)s).
- Registrados en `lib.rs`.

### JS bridge (`syncItems.bridge.js`)
- `syncItemListReady({ limit })`, `syncItemMarkProcessing(id)`, `syncItemMarkDone(id, sessionRef?)`, `syncItemMarkFailed(id, lastError?)` con fallbacks en memoria.

### Repository (`localSyncItemsRepository.js`)
- Wrappers: `listReadySyncItems`, `markSyncItemProcessing`, `markSyncItemDone`, `markSyncItemFailed`.

### Servicio (`localSyncDequeueService.js`)
- `dequeueReadyItems({ batchSize })`: itera candidatos, marca cada uno como processing antes de retornarlo.
- Si markProcessing falla → marca failed y omite ese item.
- `rollbackStaleProcessingItems()`: stub para recovery futuro.

## Criterios de aceptacion
- [x] Items approved+pending extraídos y marcados como processing.
- [x] Backoff exponencial en retry_at al marcar failed.
- [x] lint + build:web + test:shell-smoke OK.
