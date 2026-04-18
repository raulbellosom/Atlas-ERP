# T-0909 - Configurar bridge de estado de red

## Metadatos
- ID: `T-0909`
- Fase: `Fase 9`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Habilitar detección base de estado de red para desktop con bridge nativo y fallback web.

## Implementación
- Se implementó comando Tauri `network_status` con probe TCP (`1.1.1.1:53`, `8.8.8.8:53`).
- Se agregó bridge frontend `network.bridge.js`:
  - `getDesktopNetworkStatus()`
  - `subscribeBrowserNetworkStatus()`
- Se integró smoke visual en `App.jsx` para mostrar estado inicial de red en runtime.

## Criterios de aceptación
- [x] Comando de estado de red disponible en backend desktop.
- [x] Bridge frontend disponible con fallback para navegador.
- [x] Estado de red visible en shell base.

## Evidencia
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src/bridge/network.bridge.js`
- `apps/desktop/src/App.jsx`

