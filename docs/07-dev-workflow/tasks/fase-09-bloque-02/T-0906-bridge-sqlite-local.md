# T-0906 - Configurar bridge de SQLite local

## Metadatos
- ID: `T-0906`
- Fase: `Fase 9`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Establecer bridge base para SQLite local desde frontend desktop hacia comandos nativos Tauri.

## Implementación
- Se agregaron comandos Tauri para SQLite local:
  - `sqlite_init`
  - `sqlite_execute`
  - `sqlite_execute_batch`
  - `sqlite_query`
- Se configuró bootstrap de SQLite con PRAGMAs base (`WAL`, `foreign_keys`, `synchronous`).
- Se creó tabla meta mínima `__atlaserp_meta` al inicializar.
- Se implementó bridge frontend en `sqlite.bridge.js`.

## Criterios de aceptación
- [x] Inicialización de SQLite local disponible por comando.
- [x] Ejecución de SQL unitario y batch disponible.
- [x] Consulta SQL con respuesta serializable para frontend.

## Evidencia
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src/bridge/sqlite.bridge.js`

