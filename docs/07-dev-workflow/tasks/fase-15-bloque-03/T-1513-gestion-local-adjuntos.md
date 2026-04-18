# T-1513 - Crear gestión local de adjuntos

## Metadatos
- ID: `T-1513`
- Fase: `Fase 15`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar la gestión de adjuntos (comprobantes de pago) en modo offline para la aplicación desktop Tauri, almacenando los archivos en el sistema de archivos local y encolando su upload a MinIO + vinculación al movimiento para cuando se recupere la conexión.

## Alcance
- Usar el File System de Tauri (`tauri-plugin-fs`) para guardar adjuntos offline:
  - Directorio: `$APPDATA/atlaserp/finops/attachments-pending/`.
  - Nombre de archivo: `{localMovementId}_{originalFilename}`.
- Crear tabla `finops_attachment_queue` en SQLite:
  - Columnas: `id`, `localMovementId`, `backendMovementId` (nullable hasta sync), `localPath`, `originalFilename`, `mimeType`, `sizeBytes`, `status`, `createdAt`.
- Adaptar `AttachmentViewer` desktop para:
  - Mostrar adjuntos ya sincronizados (URL de MinIO) y adjuntos pendientes (path local).
  - Preview de imagen desde path local usando `convertFileSrc` de Tauri.
- Crear handler `finops-attachment-upload.handler.ts` en el Sync Core:
  - Al desencolar: leer el archivo desde `localPath` → subir a MinIO via `POST /api/v1/attachments/upload` → vincular al movimiento con `POST /api/v1/financial-movements/:id/attachments`.
  - Eliminar el archivo local tras upload exitoso.
  - Actualizar `finops_attachment_queue` con el `attachmentId` del backend.
- Orden de sync garantizado: el movimiento debe estar sincronizado antes de subir sus adjuntos (el handler verifica que `backendMovementId` existe antes de proceder).

## Fuera de alcance
- Adjuntos en transferencias offline (solo en movimientos en v1 — T-1414 es solo web).
- Límite de tamaño de archivo offline (se hereda del límite del backend — 10MB por defecto).
- Compresión de imágenes offline antes de upload (Fase 17+).

## Dependencias
- `T-1502`: SQLite disponible.
- `T-1507`: movimientos offline sincronizados antes de procesar adjuntos.
- `T-1330`: endpoint de upload de adjuntos disponible en el backend.
- `T-1414`: `AttachmentViewer` web como referencia para la versión desktop.

## Criterios de aceptación
- [ ] Adjunto guardado en filesystem local al adjuntar en modo offline.
- [ ] Preview de imagen local funcional en el visor de adjuntos.
- [ ] Handler de upload procesa adjuntos solo después de que el movimiento esté sincronizado.
- [ ] Archivo local eliminado tras upload exitoso.
- [ ] `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.

## Validaciones
- `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.
- Revisión manual: offline → crear movimiento + adjuntar imagen → preview visible → reconectar → movimiento sincronizado → adjunto subido → URL de MinIO disponible.

## Pruebas
- Offline: adjuntar imagen a movimiento offline → archivo en `$APPDATA/.../attachments-pending/` → preview visible.
- Reconectar → movimiento sync primero → adjunto subido → archivo local eliminado.
- Error de upload (ej. archivo corrupto) → `finops_attachment_queue` en estado `ERROR` → usuario puede reintentar o descartar.

## Riesgos
- **Orden de dependencia movimiento → adjunto en el Sync Core**: si el handler de adjunto se procesa antes que el handler del movimiento, `backendMovementId` es null y el upload falla. Mitigación: el handler de adjuntos verifica que `backendMovementId` esté presente antes de proceder; si no lo está, reencola con delay.
- **Acumulación de archivos locales si el sync falla**: si los uploads fallan repetidamente, los archivos se acumulan en `$APPDATA`. Mitigación: mostrar advertencia al usuario si el directorio supera 50MB.

## Documentación a actualizar
- `apps/desktop/src-tauri/migrations/finops/004_finops_attachment_queue.sql` — tabla nueva.
- `apps/desktop/src/modules/finops/sync/finops-attachment-upload.handler.ts` — archivo nuevo.
- `apps/desktop/src/modules/finops/components/AttachmentViewerDesktop.tsx` — adaptación desktop.

## Decisiones clave
- **Filesystem local, no base64 en SQLite**: guardar el archivo como base64 en SQLite inflaría la BD local innecesariamente. Se guarda solo el path en SQLite y el archivo en el filesystem del SO.
- **Sync dependiente del movimiento**: los adjuntos se sincronizan después del movimiento, nunca antes. Esto garantiza que el backend puede vincular el adjunto al movimiento real (no al UUID temporal local).

## Evidencia documental
- `apps/desktop/src-tauri/migrations/finops/004_finops_attachment_queue.sql`
- `apps/desktop/src/modules/finops/sync/finops-attachment-upload.handler.ts`
- `apps/desktop/src/modules/finops/components/AttachmentViewerDesktop.tsx`

## Pendientes para la siguiente task
- `T-1514` implementa las reglas de bloqueo de operaciones incompatibles en la UI.

## Pendientes no resueltos
- Ninguno.
