# T-0921 - Configurar manejo de conflictos descargados

## Metadatos
- ID: `T-0921`
- Fase: `Fase 9`
- Bloque: `Bloque 5`
- Estado: `CERRADA`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Persistir y consultar conflictos descargados en desktop para habilitar resolución diferida durante sincronización.

## Implementación
- Migración local SQLite agregada para `sync_conflicts`.
- Comandos Tauri agregados:
  - `sync_conflict_store`
  - `sync_conflict_list`
  - `sync_conflict_mark_resolved`
  - `sync_conflict_pending_count`
- Bridge y repositorio local agregados:
  - `src/bridge/conflicts.bridge.js`
  - `src/modules/sync/localConflictRepository.js`
- `useDesktopBootstrap` consulta conteo de conflictos pendientes y lo expone a UI.
- Panel local de sync muestra conflictos pendientes.

## Criterios de aceptación
- [x] Registro local de conflictos descargados disponible.
- [x] Listado/contador de conflictos pendientes disponible.
- [x] Cierre de conflictos por resolución disponible.

## Evidencia
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src/bridge/conflicts.bridge.js`
- `apps/desktop/src/modules/sync/localConflictRepository.js`
- `apps/desktop/src/hooks/useDesktopBootstrap.js`
- `apps/desktop/src/components/sync/LocalSyncStatusPanel.jsx`
