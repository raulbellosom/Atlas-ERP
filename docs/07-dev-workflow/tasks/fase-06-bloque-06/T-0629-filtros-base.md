# T-0629 - Configurar filtros base

## Metadatos
- ID: `T-0629`
- Fase: `Fase 6`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar capa base de filtros reutilizable para listados backend.

## Alcance
- Crear DTO base `BaseFiltersQueryDto`:
  - `search`
  - `includeInactive`
  - `includeDeleted`
  - `dateFrom`
  - `dateTo`
- Crear utilidades de filtros:
  - `buildIsActiveFilter(...)`
  - `buildSoftDeleteFilter(...)`
  - `buildCaseInsensitiveSearchFilter(...)`
  - `buildDateRangeFilter(...)`
- Integración inicial en servicios existentes:
  - `OrganizationsService`
  - `FeatureFlagsService`
  - `AttachmentsService`

## Fuera de alcance
- Normalización global obligatoria de todos los listados actuales.
- DSL avanzado de filtrado compuesto.

## Dependencias
- `T-0628` cerrada.

## Criterios de aceptación
- [x] DTO y utilidades de filtros base creados en capa común.
- [x] Aplicación real en al menos tres servicios existentes.
- [x] Contratos actuales de endpoints sin ruptura.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/common/query-filters/base-filters-query.dto.ts`
- `apps/api/src/common/query-filters/filters.util.ts`
- `apps/api/src/common/query-filters/index.ts`
- `apps/api/src/modules/organizations/organizations.service.ts`
- `apps/api/src/modules/feature-flags/feature-flags.service.ts`
- `apps/api/src/modules/attachments/attachments.service.ts`

## Pendientes no resueltos
- Unificar filtros base en todos los módulos conforme avance Fase 6.
