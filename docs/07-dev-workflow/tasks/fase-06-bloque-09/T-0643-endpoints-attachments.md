# T-0643 - Configurar endpoints base de attachments

## Metadatos
- ID: `T-0643`
- Fase: `Fase 6`
- Bloque: `Bloque 9`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Verificar que `AttachmentsModule` tiene todos los endpoints operativos (upload, listado, descarga segura).

## Alcance
- `POST /v1/attachments/upload` — subida multipart con validación de tipo/tamaño.
- `GET /v1/attachments` — listado filtrable.
- `GET /v1/attachments/entity/:entityType/:entityId` — adjuntos por entidad.
- `GET /v1/attachments/:id/download` — URL firmada temporal para descarga.
- `GET /v1/attachments/:id` — detalle de adjunto.
- Scope de organización validado en upload y download.

## Fuera de alcance
- Eliminación lógica de adjuntos — Fase 7.
- Scanning antivirus — pendiente de hardening.

## Dependencias
- `T-0642` cerrada.

## Criterios de aceptación
- [x] Todos los endpoints de attachments verificados operativos.
- [x] `CurrentOrganizationId` decorator integrado en upload y download.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`
- `pnpm --filter @atlasrep/api run typecheck`
- `pnpm --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/attachments/attachments.controller.ts`
- `apps/api/src/modules/attachments/attachments.service.ts`

## Pendientes no resueltos
- T-0633 (escaneo antivirus) permanece abierto.
- T-0634 (proxy de descarga) permanece abierto.
