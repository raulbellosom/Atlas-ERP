# T-0913 - Configurar migraciones locales SQLite si aplica

## Metadatos
- ID: `T-0913`
- Fase: `Fase 9`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Definir mecanismo versionado de migraciones locales SQLite para evolución incremental del esquema desktop.

## Implementación
- Se agregó pipeline de migraciones locales en `commands.rs`:
  - `LOCAL_MIGRATIONS`
  - `apply_local_migrations`
  - registro en `__atlaserp_migrations`
- Se agregaron comandos de control:
  - `sqlite_apply_migrations`
  - `sqlite_list_migrations`
- Se actualizó bridge frontend:
  - `sqliteApplyMigrations()`
  - `sqliteListMigrations()`

## Criterios de aceptación
- [x] Migraciones idempotentes con tracking de aplicadas.
- [x] Comando para aplicar migraciones disponible.
- [x] Comando para listar migraciones aplicadas disponible.

## Evidencia
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src/bridge/sqlite.bridge.js`
- `apps/desktop/src/App.jsx`

