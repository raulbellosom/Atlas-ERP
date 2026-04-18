# T-0907 - Configurar bridge de archivos locales

## Metadatos
- ID: `T-0907`
- Fase: `Fase 9`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Implementar bridge base para operaciones de archivos locales del desktop en un directorio seguro de aplicación.

## Implementación
- Se agregaron comandos Tauri:
  - `files_write_text`
  - `files_read_text`
  - `files_delete`
  - `files_exists`
- Se restringieron rutas a paths relativos seguros (sin `..`, root ni prefix de unidad).
- Se estableció `app_data_dir/files` como raíz de operaciones.
- Se creó bridge frontend en `files.bridge.js`.

## Criterios de aceptación
- [x] Operaciones básicas de archivos locales disponibles.
- [x] Validación de ruta relativa segura aplicada.
- [x] Directorio de trabajo local acotado a la app desktop.

## Evidencia
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src/bridge/files.bridge.js`

