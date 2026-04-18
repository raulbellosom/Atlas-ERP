# T-0911 - Configurar directorios locales de datos

## Metadatos
- ID: `T-0911`
- Fase: `Fase 9`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Materializar estructura de directorios locales base para operación offline-first de AtlasERP Desktop.

## Implementación
- Se definieron rutas locales en `commands.rs`:
  - `app_data_dir`
  - `db`
  - `secure`
  - `files`
  - `exports`
  - `queue`
  - `cache`
  - `logs`
  - `attachments`
  - `tmp`
- Se agregó bootstrap de directorios en `bootstrap_app_dirs`.
- Se agregó bridge para consulta/preparación de rutas:
  - `desktop_get_paths`
  - `desktop_prepare_data_dirs`
  - `src/bridge/paths.bridge.js`

## Criterios de aceptación
- [x] Directorios locales base definidos y creados al arranque.
- [x] Contrato JS para obtener paths disponible.
- [x] Paths visibles en el shell de desktop (smoke).

## Evidencia
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src/bridge/paths.bridge.js`
- `apps/desktop/src/App.jsx`

