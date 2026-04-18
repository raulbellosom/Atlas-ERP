# Blueprint Técnico: Desktop App

## Identificación
- Aplicación: `apps/desktop`
- Tecnologías: Tauri + SQLite local + WebView (reutiliza apps/web como frontend)
- Plataformas objetivo: Windows, macOS (Linux opcional)

## Propósito
Shell desktop que envuelve el frontend web y agrega capacidades nativas: acceso a SQLite local, cola de sync offline, bridges de sistema de archivos y detección de conectividad.

## Arquitectura

```
apps/desktop/
├─ src-tauri/          # Código Rust de Tauri
│  ├─ src/
│  │  ├─ main.rs       # Punto de entrada
│  │  ├─ commands/     # Comandos Tauri (bridges)
│  │  └─ db/           # Gestión de SQLite local
│  ├─ tauri.conf.json
│  └─ Cargo.toml
└─ (frontend compartido desde apps/web via build o symlink)
```

## SQLite local — propósito y límites

| Uso permitido | Prohibido |
|--------------|-----------|
| Cola de operaciones offline (`sync_queue`) | Sustituir PostgreSQL como fuente de verdad |
| Caché de datos frecuentes (snapshots) | Almacenar datos que no se sincronizarán |
| Preferencias locales del usuario | Datos sensibles sin cifrado |

## Bridges nativos mínimos esperados

- `check_connectivity` — detectar si hay conexión a internet
- `get_sqlite_path` — ruta al archivo SQLite local del usuario
- `read_local_file` / `write_local_file` — acceso a archivos locales (adjuntos, exportaciones)
- `open_file_dialog` — diálogo nativo de selección de archivo

## Cola de sync local (sync_queue)

Tabla SQLite que almacena operaciones pendientes de enviar al servidor:
- `id`, `operation_type`, `entity`, `entity_id`, `payload`, `status`, `created_at`, `synced_at`
- El worker de sync del cliente lee esta tabla y envía al endpoint de sync del backend

## Distribución
- La app desktop se distribuye como instalable nativo (.exe, .dmg), no via Docker
- El proceso de build y firma de binarios se define en Fase 4+
- Las actualizaciones se gestionan con el mecanismo de auto-update de Tauri

## Variables de entorno relevantes
- `DESKTOP_API_URL` — URL base de la API del backend
- `DESKTOP_SQLITE_PATH` — ruta de la base de datos SQLite local (opcional, default en appDataDir)
