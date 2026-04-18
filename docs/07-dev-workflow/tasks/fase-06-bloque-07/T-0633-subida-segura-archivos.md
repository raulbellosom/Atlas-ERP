# T-0633 - Configurar subida segura de archivos

## Metadatos
- ID: `T-0633`
- Fase: `Fase 6`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Implementar flujo seguro de carga de adjuntos con validaciones de archivo, scope de organización y persistencia de metadata.

## Alcance
- Agregar endpoint:
  - `POST /api/v1/attachments/upload` (multipart `file`)
- Procesamiento en memoria con límite de 20 MB.
- Validaciones de seguridad:
  - tamaño máximo
  - MIME type permitido
  - extensión permitida
  - sanitización de nombre y path de storage
- Validación de scope de organización (`x-organization-id` / `request.user.organizationId`).
- Persistencia de metadata en tabla `Attachment`.
- Upload físico a MinIO a través de `StorageService`.

## Fuera de alcance
- Escaneo antivirus/malware.
- Carga directa browser -> MinIO sin pasar por API.

## Dependencias
- `T-0632` cerrada.

## Criterios de aceptación
- [x] Endpoint de upload seguro operativo en módulo Attachments.
- [x] Validaciones de tipo/tamaño/extensión aplicadas.
- [x] No se expone `storagePath` en respuestas públicas.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/attachments/attachments.controller.ts`
- `apps/api/src/modules/attachments/attachments.service.ts`
- `apps/api/src/modules/attachments/dto/upload-attachment.dto.ts`
- `apps/api/src/modules/attachments/constants/file-policy.constants.ts`
- `apps/api/src/modules/attachments/utils/file-security.util.ts`

## Pendientes no resueltos
- Integrar escaneo antivirus para hardening de uploads.
