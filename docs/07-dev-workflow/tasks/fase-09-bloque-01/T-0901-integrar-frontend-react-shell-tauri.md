# T-0901 - Integrar frontend React con shell Tauri

## Metadatos
- ID: `T-0901`
- Fase: `Fase 9`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Conectar el frontend React/Vite con el runtime Tauri para que la app desktop arranque desde el shell nativo y permita detectar contexto desktop vs navegador.

## Implementación
- Se agregó configuración Vite para desktop (`vite.config.js`) con puerto dedicado `5174`.
- Se creó `index.html` de la app desktop para montar React.
- Se agregó `src/bridge/tauri.js` con helpers de runtime (`isTauriDesktop`, `getRuntimeLabel`).
- Se actualizó `App.jsx` para mostrar estado de runtime y variables base de entorno.
- Se validó el enlace entre Tauri y frontend desde `tauri.conf.json`:
  - `beforeDevCommand` -> `dev:web`
  - `beforeBuildCommand` -> `build:web`
  - `devUrl` -> `http://localhost:5174`

## Criterios de aceptación
- [x] Frontend React embebido en shell Tauri.
- [x] Build/development commands del frontend integrados con Tauri.
- [x] Bridge base disponible para expansión en bloques siguientes.

## Evidencia
- `apps/desktop/vite.config.js`
- `apps/desktop/index.html`
- `apps/desktop/src/bridge/tauri.js`
- `apps/desktop/src/App.jsx`
- `apps/desktop/src-tauri/tauri.conf.json`

