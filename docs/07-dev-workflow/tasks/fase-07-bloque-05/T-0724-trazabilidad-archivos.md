# T-0724 - Trazabilidad de archivos subidos en auditoría

## Metadatos
- ID: `T-0724`
- Fase: `Fase 7`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Registrar un AuditLog con acción `FILE_UPLOADED` cada vez que se suba un archivo adjunto exitosamente.

## Alcance
- Actualizar `apps/api/src/modules/attachments/attachments.module.ts`:
  - Agregar `AuditModule` a imports.
- Actualizar `apps/api/src/modules/attachments/attachments.service.ts`:
  - Importar `AuditService` y `SourceType`.
  - Inyectar `AuditService` en constructor.
  - En `uploadAttachment()`: tras crear el attachment, llamar `auditService.auditAction()` con:
    - action: `FILE_UPLOADED`
    - entityType: `Attachment`
    - entityId: `attachment.id`
    - origin: `SourceType.API`
    - result: `SUCCESS`
    - after: `{ filename, mimeType, sizeBytes, entityType, entityId }`

## Resultados
- Cada upload genera un AuditLog en la tabla `audit_logs` con acción FILE_UPLOADED.
- El log incluye metadatos del archivo en el campo `after`.

## Criterios de aceptacion
- [x] auditService.auditAction llamado tras crear el attachment.
- [x] AuditModule importado en AttachmentsModule.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Auditoría de descargas (presigned URL no registra descarga efectiva).
- Auditoría de soft-delete de attachments.

## Dependencias
- T-0700 a T-0706 (AuditModule y AuditService ya disponibles).
