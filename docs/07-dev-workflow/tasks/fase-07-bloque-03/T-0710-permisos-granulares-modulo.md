# T-0710 - Implementar permisos granulares por modulo

## Metadatos
- ID: `T-0710`
- Fase: `Fase 7`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Hacer que PermissionsGuard cargue permisos reales desde la base de datos en lugar de depender de headers contractuales o req.user.permissions pre-cargados.

## Alcance
- Actualizar `apps/api/src/common/guards/permissions.guard.ts`:
  - Inyectar `PrismaService`.
  - Hacer `canActivate` async.
  - Cuando @RequireAllPermissions o @RequireAnyPermission estan presentes:
    - Obtener `userId` de `req.user.sub`.
    - Consultar `userRole` para obtener roleIds.
    - Resolver cadena de ancestros via `parentRoleId` (herencia de permisos).
    - Consultar `rolePermission` para obtener permission keys efectivos.
    - Verificar contra los permisos requeridos.
  - Cachear permisos resueltos en `req.user.permissions` para evitar consultas duplicadas en el mismo request.
- Sin decoradores → passthrough sin consulta a DB.

## Resultados
- PermissionsGuard carga permisos reales con herencia de roles.
- Los permisos se cachean por request para evitar N+1 queries.
- Endpoints sin decoradores pasan sin overhead.

## Criterios de aceptacion
- [x] PermissionsGuard es async y usa PrismaService.
- [x] Carga roles → ancestros → permisos desde DB.
- [x] Verifica @RequireAllPermissions y @RequireAnyPermission correctamente.
- [x] Cachea en req.user.permissions.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Cache cross-request (Redis) para reducir consultas (optimizacion futura).

## Dependencias
- T-0709 cerrada (findEffectivePermissionKeys + herencia via parentRoleId).

## Pendientes no resueltos
- Ninguno.
