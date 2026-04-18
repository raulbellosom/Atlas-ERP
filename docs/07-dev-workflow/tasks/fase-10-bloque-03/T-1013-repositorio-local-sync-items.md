# T-1013 - Implementar repositorio local de sync items

## Metadatos
- ID: `T-1013`
- Fase: `Fase 10`
- Bloque: `Bloque 3`
- Estado: `CERRADA`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Implementar capa de bridge + repositorio para operar `sync_queue_items` desde frontend desktop.

## Implementación
- Bridge IPC agregado en `apps/desktop/src/bridge/syncItems.bridge.js`.
- Repositorio agregado en `apps/desktop/src/modules/sync/localSyncItemsRepository.js`.
- Comandos Tauri expuestos:
  - `sync_item_enqueue`
  - `sync_item_list`
  - `sync_item_find_by_idempotency_key`
  - `sync_item_mark_approved`
  - `sync_item_mark_rejected`
  - `sync_item_pending_count`

## Criterios de aceptación
- [x] Bridge de sync items disponible en modo desktop y fallback web.
- [x] Repositorio con normalización de shape snake_case/camelCase.
- [x] Operaciones CRUD operativas para flujo local de sync items.

## Evidencia
- `apps/desktop/src/bridge/syncItems.bridge.js`
- `apps/desktop/src/modules/sync/localSyncItemsRepository.js`
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src-tauri/src/lib.rs`
