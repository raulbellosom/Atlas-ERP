# T-0619 - Configurar módulo Attachments

## Metadatos
- ID: `T-0619`
- Fase: `Fase 6`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar el módulo `Attachments` para consulta foundation de adjuntos por entidad y organización.

## Alcance
- Crear `AttachmentsModule`, `AttachmentsController`, `AttachmentsService`.
- Crear `ListAttachmentsQueryDto`.
- Exponer rutas:
  - `GET /api/v1/attachments`
  - `GET /api/v1/attachments/:id`
  - `GET /api/v1/attachments/entity/:entityType/:entityId`
- Soportar filtros base (`organizationId`, `entityType`, `entityId`, `uploadedById`, `includeDeleted`).

## Fuera de alcance
- Carga/descarga de archivos a MinIO.
- Validaciones de seguridad de archivos y firmas.

## Dependencias
- `T-0618` cerrada.
- Modelo `Attachment` disponible desde Fase 5.

## Criterios de aceptación
- [x] Módulo `attachments` creado e importado.
- [x] Servicio Prisma con consultas de lista, detalle y por entidad.
- [x] DTO de filtros base validado por pipeline global.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/attachments/attachments.module.ts`
- `apps/api/src/modules/attachments/attachments.controller.ts`
- `apps/api/src/modules/attachments/attachments.service.ts`
- `apps/api/src/modules/attachments/dto/list-attachments.query.dto.ts`
- `apps/api/src/modules/app/app.module.ts`

## Pendientes no resueltos
- Integración de almacenamiento seguro (MinIO) en `T-0632` a `T-0634`.
