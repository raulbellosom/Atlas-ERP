# T-0908 - Configurar bridge de impresión/exportación

## Metadatos
- ID: `T-0908`
- Fase: `Fase 9`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Configurar bridge inicial de exportación de documentos y canal base de impresión para desktop.

## Implementación
- Se agregaron comandos Tauri:
  - `export_rows_to_csv`
  - `export_json_document`
  - `print_request`
- Se habilitó exportación local a `app_data_dir/exports`.
- Se agregó sanitización básica de nombre de archivo de exportación.
- Se implementó bridge frontend en `printExport.bridge.js`.

## Criterios de aceptación
- [x] Exportación CSV disponible desde bridge desktop.
- [x] Exportación JSON disponible desde bridge desktop.
- [x] API base de impresión registrada para integración nativa posterior.

## Evidencia
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src/bridge/printExport.bridge.js`

