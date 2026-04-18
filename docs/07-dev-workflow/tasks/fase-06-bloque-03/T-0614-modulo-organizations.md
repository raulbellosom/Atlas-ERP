# T-0614 - Configurar módulo Organizations

## Metadatos
- ID: `T-0614`
- Fase: `Fase 6`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar el módulo `Organizations` con endpoints foundation de consulta para organizaciones activas y búsqueda por slug.

## Alcance
- Crear `OrganizationsModule`, `OrganizationsController`, `OrganizationsService`.
- Crear `ListOrganizationsQueryDto`.
- Exponer rutas:
  - `GET /api/v1/organizations`
  - `GET /api/v1/organizations/slug/:slug`
  - `GET /api/v1/organizations/:id`
- Soportar filtros base (`search`, `includeInactive`) y soft delete.

## Fuera de alcance
- Mutaciones de organizaciones.
- Scoping multitenant automático en guards/decorators.

## Dependencias
- `T-0613` cerrada.
- Modelo `Organization` disponible desde Fase 5.

## Criterios de aceptación
- [x] Módulo `organizations` creado e importado en `AppModule`.
- [x] Servicio Prisma con búsquedas por lista, `id` y `slug`.
- [x] DTO de filtros base validado por `ValidationPipe` global.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/organizations/organizations.module.ts`
- `apps/api/src/modules/organizations/organizations.controller.ts`
- `apps/api/src/modules/organizations/organizations.service.ts`
- `apps/api/src/modules/organizations/dto/list-organizations.query.dto.ts`
- `apps/api/src/modules/app/app.module.ts`

## Pendientes no resueltos
- Ninguno.
