# T-0640 - Configurar endpoints base de organizaciones y sucursales

## Metadatos
- ID: `T-0640`
- Fase: `Fase 6`
- Bloque: `Bloque 9`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Verificar y completar los endpoints de `OrganizationsModule` y `BranchesModule`, añadiendo el endpoint jerárquico de sucursales por organización.

## Alcance
- `GET /v1/organizations` — listado filtrable (search, includeInactive).
- `GET /v1/organizations/slug/:slug` — búsqueda por slug.
- `GET /v1/organizations/:id` — detalle por id.
- `GET /v1/organizations/:id/branches` — sucursales de una organización (nuevo, via BranchesService inyectado).
- `GET /v1/branches` — listado filtrable (organizationId, includeInactive).
- `GET /v1/branches/organization/:organizationId/active-count` — conteo de sucursales activas.
- `GET /v1/branches/:id` — detalle de sucursal.
- `OrganizationsModule` importa `BranchesModule` para reutilizar `BranchesService`.

## Fuera de alcance
- Endpoints de mutación (create/update/delete) — Fase 7.

## Dependencias
- `T-0639` cerrada.

## Criterios de aceptación
- [x] `GET /v1/organizations/:id/branches` implementado.
- [x] `OrganizationsModule` importa `BranchesModule`.
- [x] Todos los endpoints de listado y detalle operativos.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`
- `pnpm --filter @atlasrep/api run typecheck`
- `pnpm --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/organizations/organizations.controller.ts`
- `apps/api/src/modules/organizations/organizations.module.ts`
- `apps/api/src/modules/branches/branches.controller.ts`
- `apps/api/src/modules/branches/branches.service.ts`

## Pendientes no resueltos
- T-0625 (scope guard organización/sucursal) permanece abierto para Fase 7.
