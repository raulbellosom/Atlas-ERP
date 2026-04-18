# T-0910 - Configurar bridge de actualizaciones futuras

## Metadatos
- ID: `T-0910`
- Fase: `Fase 9`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Definir el contrato base para futuras actualizaciones desktop sin acoplar todavía la lógica final de firma y distribución de binarios.

## Implementación
- Comandos Tauri agregados:
  - `updater_get_status`
  - `updater_check_for_updates`
- Bridge frontend agregado:
  - `src/bridge/updater.bridge.js`
- Integración de smoke en `App.jsx` para verificar disponibilidad de bridge en runtime.

## Criterios de aceptación
- [x] Contrato de estado de updater disponible.
- [x] Contrato de check de updates disponible.
- [x] Bridge consumible desde frontend desktop.

## Evidencia
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src/bridge/updater.bridge.js`
- `apps/desktop/src/App.jsx`

