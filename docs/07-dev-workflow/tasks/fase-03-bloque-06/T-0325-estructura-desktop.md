# T-0325 - Crear estructura de carpetas oficial de desktop

## Metadatos
- ID: `T-0325`
- Fase: `Fase 3`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DesktopAgent`

## Objetivo
Crear la estructura oficial de `apps/desktop/`, incluyendo el frontend React/JS embebido en Tauri y los archivos stub de la capa Rust (src-tauri).

## Criterios de aceptación

### Frontend (apps/desktop/src/)
- [x] `main.jsx` — entry point React en Tauri webview.
- [x] `App.jsx` — root component (stub).
- [x] `assets/index.css` — CSS global con directivas Tailwind.
- [x] `modules/` — feature modules (identicos a web, pero desktop-aware).
- [x] `pages/` — paginas de nivel de ruta.
- [x] `components/ui/` y `components/layout/` — componentes.
- [x] `hooks/` — custom hooks (incluira `useOnlineStatus`, `useSyncQueue`).
- [x] `api/` — llamadas HTTP al backend (modo online).
- [x] `bridge/` — capa IPC de Tauri (acceso nativo: SQLite, red, archivos).
- [x] `store/` y `lib/` — estado global y utilidades.

### Tauri/Rust (apps/desktop/src-tauri/)
- [x] `src/main.rs` — entry point Rust con `windows_subsystem = "windows"`.
- [x] `src/lib.rs` — stub con `run()`, `setup()` y TODOs de Fase 6.
- [x] `Cargo.toml` — dependencias: tauri 2, rusqlite (bundled), serde.
- [x] `tauri.conf.json` — config Tauri v2: ventana 1440x900, devUrl 5174, bundler.

## Estructura creada

```
apps/desktop/
  src/
    main.jsx           Entry point React
    App.jsx            Root component
    assets/index.css   CSS global
    modules/           Feature modules
    pages/             Paginas de ruta
    components/ui/     Componentes UI
    components/layout/ Layout components
    hooks/             Custom hooks (useOnlineStatus, etc.)
    api/               Llamadas HTTP online
    bridge/            IPC Tauri (SQLite, archivos, red)
    store/             Estado global
    lib/               Utilidades
  src-tauri/
    src/main.rs        Entry point Rust
    src/lib.rs         Tauri commands stub
    Cargo.toml         Dependencias Rust
    tauri.conf.json    Configuracion Tauri v2
```

## Diferencias respecto a apps/web

| Carpeta    | web | desktop | Motivo                                          |
| ---------- | --- | ------- | ----------------------------------------------- |
| `bridge/`  | No  | Si      | Capa de IPC Tauri — acceso a SQLite y sistema   |
| `store/`   | Si  | Si      | El desktop ademas gestiona estado offline        |
| `api/`     | Si  | Si      | Igual que web pero con fallback offline via IPC  |
| `src-tauri/` | No | Si    | Shell Rust de Tauri                             |

## Decisiones tecnicas
- **Puerto 5174 para Tauri dev**: El web usa 5173 — Tauri usa 5174 para evitar conflicto.
- **`rusqlite` bundled**: No requiere SQLite instalado en el sistema — incluido en el binario.
- **`bridge/` separado de `api/`**: `api/` = HTTP al servidor. `bridge/` = IPC nativo Tauri. Separa los dos modos de acceso a datos.
- **Tauri v2**: Version actual estable — esquema de config en `https://schema.tauri.app/config/2`.

## Pendientes no resueltos
- Bridges de SQLite, red y archivos se implementan en Fase 6 (DesktopAgent).
- `src-tauri/icons/` requiere los archivos de icono — se generan cuando haya branding definido.
