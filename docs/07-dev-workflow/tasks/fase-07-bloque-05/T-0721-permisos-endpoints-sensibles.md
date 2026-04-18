# T-0721 - Protección de endpoints sensibles con permisos

## Metadatos
- ID: `T-0721`
- Fase: `Fase 7`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Aplicar decoradores `@RequireAllPermissions` a los endpoints de alto impacto para que el PermissionsGuard los proteja explícitamente.

## Alcance
- `apps/api/src/modules/users/users.controller.ts`:
  - `POST /v1/users/:id/lock` → `@RequireAllPermissions('auth:user:write')`
  - `POST /v1/users/:id/unlock` → `@RequireAllPermissions('auth:user:write')`
  - `POST /v1/users/:id/activate` → `@RequireAllPermissions('auth:user:write')`
  - `DELETE /v1/users/:id/deactivate` → `@RequireAllPermissions('auth:user:write')`
- `apps/api/src/modules/audit/audit.controller.ts`:
  - `GET /v1/audit/logs` → `@RequireAllPermissions('audit:read')`
  - `GET /v1/audit/logs/:id` → `@RequireAllPermissions('audit:read')`

## Resultados
- Usuarios sin permiso `auth:user:write` reciben 403 al intentar bloquear/desbloquear/activar/desactivar usuarios.
- Usuarios sin permiso `audit:read` reciben 403 al intentar leer logs de auditoría.

## Criterios de aceptacion
- [x] Decoradores aplicados a los 6 endpoints listados.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Protección de endpoints de lectura general (GET /v1/users, GET /v1/users/:id).

## Dependencias
- T-0710/T-0711 (PermissionsGuard con carga de permisos desde DB).
