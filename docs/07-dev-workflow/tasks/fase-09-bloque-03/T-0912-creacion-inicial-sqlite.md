# T-0912 - Configurar creación inicial de base SQLite

## Metadatos
- ID: `T-0912`
- Fase: `Fase 9`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Garantizar creación inicial de SQLite local y tablas mínimas de operación desktop al arranque.

## Implementación
- `sqlite_init` ahora garantiza:
  - apertura de DB local en `app_data_dir/db/atlaserp-desktop.db`
  - aplicación de migraciones locales de base
- Se agregó migración base para metadata y tracking:
  - `__atlaserp_meta`
  - `__atlaserp_migrations`
- Se agregó tabla local para cola sync:
  - `sync_queue`

## Criterios de aceptación
- [x] DB local creada automáticamente al inicializar.
- [x] Tablas base creadas vía migraciones.
- [x] `sqlite_init` usable desde frontend.

## Evidencia
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src/bridge/sqlite.bridge.js`

