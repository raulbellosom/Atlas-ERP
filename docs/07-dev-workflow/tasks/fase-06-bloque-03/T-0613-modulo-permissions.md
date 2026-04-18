# T-0613 - Configurar módulo Permissions

## Metadatos
- ID: `T-0613`
- Fase: `Fase 6`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar el módulo `Permissions` con consultas foundation para catálogo de permisos reutilizable en autorización.

## Alcance
- Crear `PermissionsModule`, `PermissionsController`, `PermissionsService`.
- Crear `ListPermissionsQueryDto`.
- Exponer rutas:
  - `GET /api/v1/permissions`
  - `GET /api/v1/permissions/:key`
- Consultas con filtros base (`module`, `action`, `includeInactive`).

## Fuera de alcance
- Mutaciones de catálogo de permisos.
- Enforzamiento de permisos en guards/decorators.

## Dependencias
- `T-0612` cerrada.
- Modelo `Permission` disponible desde Fase 5.

## Criterios de aceptación
- [x] Módulo `permissions` creado e importado en `AppModule`.
- [x] Servicio Prisma con `findMany` y `findUnique` por `key`.
- [x] DTO de filtros base validado por `ValidationPipe` global.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/permissions/permissions.module.ts`
- `apps/api/src/modules/permissions/permissions.controller.ts`
- `apps/api/src/modules/permissions/permissions.service.ts`
- `apps/api/src/modules/permissions/dto/list-permissions.query.dto.ts`
- `apps/api/src/modules/app/app.module.ts`

## Pendientes no resueltos
- Ninguno.
