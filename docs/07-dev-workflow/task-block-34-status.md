# Estado de Ejecución - Fase 3 / Bloque 6

## Contexto
- Fecha de cierre de bloque: **2026-04-12**
- Fase 3: Monorepo, paquetes base y tooling
- Bloque 6: Desktop, docs, tools, env vars standards, .env.example raíz

## Estado del bloque
- Bloque `T-0325` a `T-0329`: **CERRADO**

## Estado por task

| ID     | Título                                              | Estado  | Evidencia                                                                                          |
| ------ | --------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| T-0325 | Crear estructura de carpetas oficial de desktop     | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-06/T-0325-estructura-desktop.md`                        |
| T-0326 | Crear estructura de carpetas oficial de docs        | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-06/T-0326-estructura-docs.md`                           |
| T-0327 | Crear estructura de carpetas oficial de tools       | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-06/T-0327-estructura-tools.md`                          |
| T-0328 | Configurar estándares de variables de entorno       | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-06/T-0328-estandares-env-vars.md`                       |
| T-0329 | Crear `.env.example` raíz                           | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-06/T-0329-env-example-raiz.md`                          |

## Archivos creados en este bloque

### Desktop (apps/desktop/)
- `src/main.jsx`, `src/App.jsx`, `src/assets/index.css` — entry points
- `src/modules/`, `src/pages/`, `src/components/ui/`, `src/components/layout/`
- `src/hooks/`, `src/api/`, `src/bridge/`, `src/store/`, `src/lib/`
- `src-tauri/src/main.rs` — entry point Rust (Tauri v2)
- `src-tauri/src/lib.rs` — stub con run() y TODOs de Fase 6
- `src-tauri/Cargo.toml` — dependencias: tauri 2, rusqlite bundled, serde
- `src-tauri/tauri.conf.json` — config Tauri v2 (ventana 1440x900, devUrl 5174)

### ADR
- `docs/09-adr/README.md` — indice de ADRs, formato y estados

### Tools
- `tools/generators/README.md` — generadores planificados con uso documentado

### Env vars
- `docs/02-architecture/18-referencia-env-vars.md` — catalogo completo por app
- `.env.example` — variables de infraestructura compartida (raiz)

## Siguiente bloque
**Fase 3 / Bloque 7** (`T-0330` a `T-0334`): `.env.example` por app (web, worker, desktop) y validacion de env vars en arranque para api, web, worker y desktop.
