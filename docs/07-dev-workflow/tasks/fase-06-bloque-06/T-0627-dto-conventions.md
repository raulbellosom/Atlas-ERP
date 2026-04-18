# T-0627 - Configurar DTO conventions

## Metadatos
- ID: `T-0627`
- Fase: `Fase 6`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Establecer convenciones DTO base reutilizables para parámetros y scopes comunes.

## Alcance
- Crear DTOs base en `common/dto`:
  - `IdParamDto`
  - `OrganizationScopeQueryDto`
  - `BranchScopeQueryDto`
- Crear barrel `common/dto/index.ts` para importación consistente.

## Fuera de alcance
- Migración completa de todos los módulos existentes a estos DTOs.
- Convenciones de DTOs de dominio avanzado (sync/auth profundo).

## Dependencias
- `T-0626` cerrada.

## Criterios de aceptación
- [x] DTOs base versionados en capa común.
- [x] Validaciones de entrada mínimas definidas (`class-validator`).
- [x] Contrato de importación unificado vía barrel.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/common/dto/id-param.dto.ts`
- `apps/api/src/common/dto/organization-scope-query.dto.ts`
- `apps/api/src/common/dto/branch-scope-query.dto.ts`
- `apps/api/src/common/dto/index.ts`

## Pendientes no resueltos
- Aplicar estos DTOs base progresivamente en endpoints existentes y nuevos.
