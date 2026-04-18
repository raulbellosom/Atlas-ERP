# Desktop Master Prompt

## ID de task origen

- `T-0115`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Instrucción

Construye el cliente desktop de AtlasERP con Tauri, reutilizando el frontend React como base visual e integrando capacidades nativas donde sean necesarias.

### Stack

- Tauri como shell nativo.
- Frontend React compartido desde `apps/web` (misma base visual).
- SQLite local para caché, cola de sync y snapshots.
- Rust solo donde Tauri lo requiera para bridges nativos.

### Bridges nativos (mínimos y claros)

- **SQLite**: lectura/escritura de base local para cola de sync, caché y datos offline.
- **Archivos locales**: gestión de adjuntos descargados y pendientes de subir.
- **Estado de red**: detección online/offline para cambiar comportamiento de la app.
- **Impresión/exportación**: bridges para imprimir reportes o exportar archivos.
- **Almacenamiento seguro**: credenciales y tokens de sesión.
- **Actualizaciones**: bridge futuro para sistema de auto-update.

### Flujos clave

- Arranque autenticado: verificar token local, intentar refresh con servidor.
- Arranque offline: cargar sesión local, habilitar modo offline parcial.
- Cola de sync: encolar operaciones offline, desencolar al reconectar.
- Recuperación post-reinicio: restaurar cola local y estado de sync.

### Restricciones

- La lógica de negocio vive en backend y frontend compartido.
- Tauri actúa como shell y puente local, no como backend alternativo.
- SQLite no sustituye PostgreSQL central.
- No distribuir la app desktop en Docker.
- Bridges nativos mínimos; evitar duplicar lógica que ya existe en el frontend.

### Referencia

- `docs/00-canon/01_architecture_principles.md`
- `docs/05-sync/00-politica-soporte-offline.md`
- `docs/03-domain-blueprints/sync-core.md`
- `monorepo-structure.txt`
