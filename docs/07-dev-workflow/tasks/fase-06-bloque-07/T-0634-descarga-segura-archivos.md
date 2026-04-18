# T-0634 - Configurar descargas seguras de archivos

## Metadatos
- ID: `T-0634`
- Fase: `Fase 6`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Implementar flujo seguro de descarga de adjuntos vía URLs firmadas temporales, validando scope de organización y existencia física.

## Alcance
- Agregar endpoint:
  - `GET /api/v1/attachments/:id/download`
- Generación de URL firmada con expiración configurable:
  - query `expiresInSeconds` (60..3600)
  - fallback `S3_PRESIGNED_EXPIRY_SECONDS`
- Validaciones de seguridad:
  - adjunto existente y no eliminado lógicamente
  - archivo físico existente en MinIO
  - scope de organización obligatorio y coincidente
- Soporte de `S3_PUBLIC_URL` para ajustar host público de URLs firmadas.

## Fuera de alcance
- Descarga por streaming proxy desde API.
- Watermarking o cifrado por archivo.

## Dependencias
- `T-0633` cerrada.

## Criterios de aceptación
- [x] Endpoint de descarga segura implementado.
- [x] URL firmada temporal con expiración controlada.
- [x] Scope de organización validado antes de firmar URL.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/attachments/attachments.controller.ts`
- `apps/api/src/modules/attachments/attachments.service.ts`
- `apps/api/src/modules/attachments/dto/download-attachment.query.dto.ts`
- `apps/api/src/infrastructure/storage/storage.service.ts`
- `apps/api/src/config/env.validation.ts`

## Pendientes no resueltos
- Evaluar endpoint proxy de descarga para ambientes con restricciones de red a MinIO.
