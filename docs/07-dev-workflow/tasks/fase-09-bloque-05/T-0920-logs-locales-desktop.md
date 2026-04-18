# T-0920 - Configurar logs locales desktop

## Metadatos
- ID: `T-0920`
- Fase: `Fase 9`
- Bloque: `Bloque 5`
- Estado: `CERRADA`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Implementar bitácora local del shell desktop para soporte operativo y diagnóstico de arranque/sync.

## Implementación
- Migración local SQLite agregada para `desktop_logs`.
- Comandos Tauri agregados:
  - `desktop_log_append`
  - `desktop_log_list`
  - `desktop_log_rotate`
- Bridge y repositorio local agregados:
  - `src/bridge/logs.bridge.js`
  - `src/modules/logs/localDesktopLogRepository.js`
- `useDesktopBootstrap` escribe logs de inicio/fin/error y aplica rotación.
- UI muestra resumen de últimos logs en el shell base.

## Criterios de aceptación
- [x] Registro de logs locales disponible.
- [x] Consulta de logs recientes disponible.
- [x] Rotación de logs disponible.

## Evidencia
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src/bridge/logs.bridge.js`
- `apps/desktop/src/modules/logs/localDesktopLogRepository.js`
- `apps/desktop/src/hooks/useDesktopBootstrap.js`
- `apps/desktop/src/App.jsx`
