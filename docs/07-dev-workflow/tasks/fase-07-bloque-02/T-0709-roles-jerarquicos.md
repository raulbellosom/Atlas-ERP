# T-0709 - Implementar roles jerarquicos

## Metadatos
- ID: `T-0709`
- Fase: `Fase 7`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Agregar jerarquia de roles mediante campo `level` (nivel numerico de seniority) y `parentRoleId` (relacion padre-hijo entre roles), mas herencia de permisos en la resolucion efectiva.

## Alcance
- Actualizar `prisma/schema.prisma` — modelo Role:
  - `level Int @default(0)` — nivel de seniority (admin:100, operativos:50).
  - `parentRoleId String?` — FK a si mismo (rol padre opcional).
  - Relacion `parentRole Role? @relation("RoleHierarchy")` y `childRoles Role[]`.
  - Indice en `parentRoleId`.
- Ejecutar `prisma db push` para aplicar cambios.
- Actualizar `prisma/seeds/roles.seed.ts` — level 100 para admin, 50 para tesorero/auditor.
- Actualizar `apps/api/src/modules/roles/roles.service.ts`:
  - Agregar `level`, `parentRoleId` a `ROLE_SELECT` y `RoleSummary`.
  - `findAll` ordena por `level desc` primero.
  - Agregar `findEffectivePermissionKeys(roleIds)`:
    - Recorre chain de padres iterativamente.
    - Acumula todos los roleIds incluyendo ancestros.
    - Retorna set unico de permission keys.

## Resultados
- GET /v1/roles retorna admin con level:100, tesorero/auditor con level:50.
- parentRoleId: null para todos los roles fundacionales (sin padre asignado).
- `findEffectivePermissionKeys` disponible para uso en PermissionsGuard (T-0710+).

## Criterios de aceptacion
- [x] Schema: level y parentRoleId en Role model.
- [x] db push exitoso.
- [x] Seeds: admin level=100, tesorero=50, auditor=50.
- [x] GET /v1/roles retorna level y parentRoleId por rol.
- [x] findEffectivePermissionKeys resuelve ancestros recursivamente.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Asignacion de parentRoleId via API (endpoint de gestion de roles).
- Validacion de ciclos en la jerarquia.

## Dependencias
- T-0702 cerrada (schema Prisma y db push disponibles).

## Pendientes no resueltos
- Ninguno.
