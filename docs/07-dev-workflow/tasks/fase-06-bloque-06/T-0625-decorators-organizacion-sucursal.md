# T-0625 - Configurar decorators de organización/sucursal

## Metadatos
- ID: `T-0625`
- Fase: `Fase 6`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar decorators base para scoping por organización y sucursal, incluyendo extracción de contexto desde request.

## Alcance
- Crear metadata keys de scope:
  - `ORGANIZATION_SCOPE_KEY`
  - `BRANCH_SCOPE_KEY`
- Crear decorators:
  - `RequireOrganizationScope()`
  - `RequireBranchScope()`
  - `CurrentOrganizationId`
  - `CurrentBranchId`
- Soportar lectura de IDs desde `request.user` y headers:
  - `x-organization-id`
  - `x-branch-id`

## Fuera de alcance
- Guard de enforcement de scope por organización/sucursal.
- Resolución multitenant completa ligada a JWT productivo.

## Dependencias
- `T-0624` cerrada.

## Criterios de aceptación
- [x] Decorators de scope creados y tipados.
- [x] Metadata de organización/sucursal disponible para guards futuros.
- [x] Param decorators listos para uso en controladores.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/common/constants/scope.constants.ts`
- `apps/api/src/common/decorators/scope.decorator.ts`

## Pendientes no resueltos
- Integrar guard de scope organization/branch en bloques posteriores.
