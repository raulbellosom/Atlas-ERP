# T-0713 - Implementar scoping por sucursal

## Metadatos
- ID: `T-0713`
- Fase: `Fase 7`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Extender ScopeGuard (creado en T-0712) para soportar @RequireBranchScope(), que verifica que el branchId en la URL o body coincide con el branchId del usuario autenticado.

## Alcance
- En `apps/api/src/common/guards/scope.guard.ts` (mismo archivo que T-0712):
  - Lee metadata de `BRANCH_SCOPE_KEY` via Reflector.
  - Si presente: compara `req.params.branchId || req.body.branchId || req.query.branchId` contra `req.user.branchId`.
  - Si el branchId del usuario es null (admin sin sucursal asignada) → passthrough (acceso completo).
  - Si el branchId del usuario es no-null y difiere del request → ForbiddenException.

## Resultados
- ScopeGuard maneja tanto organization scope como branch scope en un solo guard.
- Admins sin sucursal asignada (branchId: null en JWT) tienen acceso cross-branch.
- @RequireBranchScope() disponible para endpoints especificos de sucursal.

## Criterios de aceptacion
- [x] @RequireBranchScope() activa la verificacion de branchId.
- [x] Usuario sin branchId (null) → passthrough.
- [x] ForbiddenException si branchId no coincide y el usuario tiene sucursal asignada.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Soporte para sucursales jerarquicas o agrupadas.

## Dependencias
- T-0712 cerrada (ScopeGuard base).
- T-0701 cerrada (JWT payload con branchId).

## Pendientes no resueltos
- Ninguno.
