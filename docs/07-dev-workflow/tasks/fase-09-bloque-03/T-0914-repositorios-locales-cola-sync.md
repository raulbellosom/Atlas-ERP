# T-0914 - Configurar repositorios locales para cola de sync

## Metadatos
- ID: `T-0914`
- Fase: `Fase 9`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Crear repositorio local de cola de sincronización para operación offline-first desde desktop.

## Implementación
- Comandos Tauri agregados:
  - `sync_queue_enqueue`
  - `sync_queue_list`
  - `sync_queue_mark_processing`
  - `sync_queue_mark_done`
  - `sync_queue_mark_failed`
  - `sync_queue_pending_count`
- Bridge frontend agregado:
  - `src/bridge/syncQueue.bridge.js`
- Repositorio local JS agregado:
  - `src/modules/sync/localSyncQueueRepository.js`
- Integración smoke en `App.jsx` con conteo de pendientes.

## Criterios de aceptación
- [x] Enqueue/listado de cola local disponibles.
- [x] Transiciones de estado de cola disponibles.
- [x] Repositorio JS reusable por módulo de sync.

## Evidencia
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src/bridge/syncQueue.bridge.js`
- `apps/desktop/src/modules/sync/localSyncQueueRepository.js`
- `apps/desktop/src/App.jsx`

