# T-0628 - Configurar paginación base

## Metadatos
- ID: `T-0628`
- Fase: `Fase 6`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar capa base de paginación reutilizable para consultas backend.

## Alcance
- Crear DTO base `PaginationQueryDto` (`page`, `limit`).
- Crear tipos de paginación:
  - `PaginationMeta`
  - `PaginatedResult<T>`
  - `PaginationQueryResolved`
- Crear utilidades:
  - `resolvePaginationQuery(...)`
  - `buildPaginationMeta(...)`
  - `toPaginatedResult(...)`
- Integración inicial en `SyncService.findSessions` con `skip/take` basado en paginación base.

## Fuera de alcance
- Migración completa de todos los listados del backend a paginación.
- Contracto HTTP final de respuestas paginadas globales.

## Dependencias
- `T-0627` cerrada.

## Criterios de aceptación
- [x] Capa de paginación común creada y exportada.
- [x] Al menos un módulo adoptando paginación base (`SyncModule`).
- [x] Sin romper contratos existentes de endpoint.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/common/pagination/pagination-query.dto.ts`
- `apps/api/src/common/pagination/pagination.types.ts`
- `apps/api/src/common/pagination/pagination.util.ts`
- `apps/api/src/common/pagination/index.ts`
- `apps/api/src/modules/sync/dto/list-sync-sessions.query.dto.ts`
- `apps/api/src/modules/sync/sync.service.ts`

## Pendientes no resueltos
- Estandarizar payload paginado en todos los módulos en bloques posteriores.
