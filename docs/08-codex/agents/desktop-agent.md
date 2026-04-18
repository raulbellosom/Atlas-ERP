# Desktop Agent

## ID de task origen

- `T-0105`

## Nombre canónico

- `DesktopAgent`

## Responsabilidad

Diseñar, implementar y mantener el shell de escritorio Tauri de AtlasERP, incluyendo bridges nativos, SQLite local, cola de sync, almacenamiento local seguro y capacidades exclusivas del cliente desktop.

## Alcance

- Configurar y mantener el proyecto Tauri en `apps/desktop`.
- Integrar el frontend React compartido dentro del shell Tauri.
- Implementar bridge de SQLite local para caché, cola de sync y snapshots.
- Implementar bridge de archivos locales (gestión de adjuntos offline).
- Implementar bridge de estado de red (detección online/offline).
- Implementar bridge de impresión/exportación local.
- Configurar almacenamiento local seguro (credenciales, tokens).
- Configurar directorios locales de datos y logs.
- Implementar arranque desktop autenticado y arranque offline.
- Implementar recuperación de cola local tras reinicio.
- Configurar migraciones locales SQLite cuando aplique.
- Configurar logs locales desktop.

## Fuera de alcance

- Lógica de negocio del backend (corresponde al `BackendAPIAgent`).
- UI de componentes reutilizables (corresponde al `DesignSystemAgent`).
- Backend de sincronización (corresponde al `SyncEngineAgent` para la parte servidor).
- Infraestructura de deploy del servidor (corresponde al `DevOpsCIAgent`).

## Interacciones clave

- Reutiliza el frontend construido por `FrontendWebAgent`.
- Consume API provista por `BackendAPIAgent`.
- Colabora con `SyncEngineAgent` para cola local y resolución de conflictos.
- Colabora con `SystemArchitectAgent` para estructura de bridges.

## Restricciones

- La lógica de negocio vive en backend y frontend compartido, no en Tauri nativo.
- SQLite solo se usa para cola, caché y snapshots controlados.
- Los bridges nativos deben ser mínimos y claros.
- No distribuir la app desktop como contenedor Docker.

## Documentos de referencia

- `docs/00-canon/01_architecture_principles.md`
- `docs/05-sync/00-politica-soporte-offline.md`
- `docs/03-domain-blueprints/sync-core.md`
- `monorepo-structure.txt`
