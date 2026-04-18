# T-0919 - Configurar recuperación de cola local tras reinicio

## Metadatos
- ID: `T-0919`
- Fase: `Fase 9`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Recuperar la cola local de sincronización después de reinicios inesperados para evitar items atascados en estado `processing`.

## Implementación
- Comando Tauri agregado:
  - `sync_queue_recover_after_restart`
- Comando de resumen agregado:
  - `sync_queue_summary`
- Bridge frontend extendido:
  - `syncQueueRecoverAfterRestart`
  - `syncQueueSummary`
- Repositorio local extendido:
  - `recoverSyncQueueAfterRestart`
  - `summarizeSyncQueue`
- Hook bootstrap ejecuta recuperación al arranque y guarda conteo recuperado.

## Criterios de aceptación
- [x] Recuperación automática de items `processing` al iniciar desktop.
- [x] Conteo de recuperados disponible para UI.
- [x] Resumen de cola disponible para panel local.

## Evidencia
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src/bridge/syncQueue.bridge.js`
- `apps/desktop/src/modules/sync/localSyncQueueRepository.js`
- `apps/desktop/src/hooks/useDesktopBootstrap.js`

