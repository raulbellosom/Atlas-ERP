# T-0712 - Implementar scoping por organizacion

## Metadatos
- ID: `T-0712`
- Fase: `Fase 7`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Crear ScopeGuard que, cuando el decorador @RequireOrganizationScope() esta presente, verifica que el organizationId en la URL o body coincide con el organizationId del usuario autenticado (del JWT).

## Alcance
- Crear `apps/api/src/common/guards/scope.guard.ts`:
  - `@Injectable() export class ScopeGuard implements CanActivate`
  - Lee metadata de `ORGANIZATION_SCOPE_KEY` via Reflector.
  - Si presente: compara `req.params.organizationId || req.body.organizationId || req.query.organizationId` contra `req.user.organizationId`.
  - Si el ID es diferente → ForbiddenException: "No tiene acceso a recursos de otra organizacion."
  - Si el ID esta ausente en la request → passthrough (no podemos asumir que toda request tiene orgId).
- Registrar como APP_GUARD en AppModule (despues de RolesGuard).

## Resultados
- ScopeGuard creado y registrado globalmente.
- @RequireOrganizationScope() disponible para decorar endpoints sensibles.
- @CurrentOrganizationId y @CurrentBranchId param decorators ya existian en scope.decorator.ts.

## Criterios de aceptacion
- [x] ScopeGuard registrado como APP_GUARD en AppModule.
- [x] @RequireOrganizationScope() activa la verificacion.
- [x] Sin el decorador → passthrough.
- [x] ForbiddenException si orgId no coincide.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Soporte para multi-tenancy con organizaciones anidadas.
- Scoping automatico sin decorador (inyeccion de orgId en todos los queries).

## Dependencias
- T-0701 cerrada (JWT payload con organizationId).

## Pendientes no resueltos
- Ninguno.
