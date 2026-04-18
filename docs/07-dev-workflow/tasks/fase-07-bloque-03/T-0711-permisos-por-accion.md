# T-0711 - Implementar permisos por accion

## Metadatos
- ID: `T-0711`
- Fase: `Fase 7`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Los permisos ya se modelan como `module:action` (e.g. audit:read, user:write). La verificacion por accion granular (e.g. @RequireAllPermissions('user:write')) ya esta soportada por el PermissionsGuard actualizado en T-0710.

## Alcance
- Los permisos en DB tienen formato `module:action`:
  - `audit:read`, `audit:write`
  - `user:read`, `user:write`
  - `role:read`, `role:write`
  - `permission:read`, `permission:write`
  - `organization:read`, `organization:write`
  - `branch:read`, `branch:write`
  - `sync:read`
- El decorador `@RequireAllPermissions('audit:read')` o `@RequireAnyPermission('user:read', 'user:write')` activa la verificacion granular.
- `PermissionsGuard` ya soporta ambos modos: ALL (todos deben cumplirse) y ANY (al menos uno).
- La herencia jerarquica de roles (parentRoleId) acumula permisos de roles ancestros.

## Resultados
- Verificacion granular por modulo + accion funcional.
- 13 permisos seeded cubriendo todos los modulos core.
- @RequireAllPermissions y @RequireAnyPermission decoradores disponibles.

## Criterios de aceptacion
- [x] Permission key format `module:action` en todos los permisos.
- [x] @RequireAllPermissions verifica que TODOS los permisos esten presentes.
- [x] @RequireAnyPermission verifica que AL MENOS UNO este presente.
- [x] Herencia de roles acumula permisos de ancestros.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Permisos condicionados a estado de entidad (e.g. solo permitir editar si owner).
- Permisos dinamicos por datos (row-level security).

## Dependencias
- T-0710 cerrada (PermissionsGuard DB-backed).

## Pendientes no resueltos
- Ninguno.
