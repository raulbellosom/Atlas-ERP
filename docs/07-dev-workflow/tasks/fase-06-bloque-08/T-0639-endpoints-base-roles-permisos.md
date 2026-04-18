# T-0639 - Configurar endpoints base de roles/permisos

## Metadatos
- ID: `T-0639`
- Fase: `Fase 6`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Verificar y completar los endpoints base de `RolesModule` y `PermissionsModule`, añadiendo el endpoint de permisos por rol.

## Alcance
- `GET /v1/roles` — listado filtrable (organizationId, includeInactive).
- `GET /v1/roles/:id` — detalle de rol con contadores.
- `GET /v1/roles/:id/permissions` — permisos asignados al rol (nuevo).
- `GET /v1/permissions` — listado filtrable (module, action, includeInactive).
- `GET /v1/permissions/:key` — permiso por clave.
- Ambos módulos exportan sus servicios para reutilización.

## Fuera de alcance
- Endpoints de mutación (create/update/delete de roles y permisos) — Fase 7.
- Asignación de permisos a roles — Fase 7.

## Dependencias
- `T-0638` cerrada.

## Criterios de aceptación
- [x] `GET /v1/roles/:id/permissions` implementado en `RolesService.findPermissionsByRoleId()`.
- [x] Endpoint registrado en `RolesController`.
- [x] `RolesModule` y `PermissionsModule` exportan sus servicios.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`
- `pnpm --filter @atlasrep/api run typecheck`
- `pnpm --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/roles/roles.service.ts`
- `apps/api/src/modules/roles/roles.controller.ts`
- `apps/api/src/modules/permissions/permissions.service.ts`
- `apps/api/src/modules/permissions/permissions.controller.ts`

## Pendientes no resueltos
- Ninguno. Pendiente T-0624 (decorators masivos) resuelto con scope en T-0639+.
