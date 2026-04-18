# T-0615 - Configurar módulo Branches

## Metadatos
- ID: `T-0615`
- Fase: `Fase 6`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar el módulo `Branches` para consultas foundation de sucursales por organización.

## Alcance
- Crear `BranchesModule`, `BranchesController`, `BranchesService`.
- Crear `ListBranchesQueryDto`.
- Exponer rutas:
  - `GET /api/v1/branches`
  - `GET /api/v1/branches/:id`
  - `GET /api/v1/branches/organization/:organizationId/active-count`
- Integrar módulo en `AppModule`.

## Fuera de alcance
- Alta/edición/baja de sucursales.
- Reglas de permisos por rol para mutaciones.

## Dependencias
- `T-0614` cerrada.
- Modelo `Branch` disponible desde Fase 5.

## Criterios de aceptación
- [x] Módulo `branches` creado e importado.
- [x] Servicio Prisma con `findMany`, `findFirst`, `count`.
- [x] DTO de filtros base validado por pipeline global.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/branches/branches.module.ts`
- `apps/api/src/modules/branches/branches.controller.ts`
- `apps/api/src/modules/branches/branches.service.ts`
- `apps/api/src/modules/branches/dto/list-branches.query.dto.ts`
- `apps/api/src/modules/app/app.module.ts`

## Pendientes no resueltos
- Ninguno.
