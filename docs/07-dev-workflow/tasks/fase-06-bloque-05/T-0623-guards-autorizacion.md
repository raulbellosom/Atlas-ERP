# T-0623 - Configurar guards de autorización

## Metadatos
- ID: `T-0623`
- Fase: `Fase 6`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar guards de autorización para evaluar permisos y roles con metadata de NestJS.

## Alcance
- Crear constantes de autorización (`permissions` y `roles`).
- Crear `PermissionsGuard`.
- Crear `RolesGuard`.
- Registrar ambos guards como `APP_GUARD` globales en `AppModule`, después del guard de autenticación.
- Soportar lectura de permisos/roles desde `request.user` y headers de apoyo:
  - `x-atlas-permissions`
  - `x-atlas-roles`

## Fuera de alcance
- Resolución final de permisos desde JWT/sesión productiva.
- Motor completo de RBAC/ABAC por organización y sucursal.

## Dependencias
- `T-0622` cerrada.

## Criterios de aceptación
- [x] Guards globales de autorización activos.
- [x] Si un endpoint no declara metadata de permisos/roles, no se bloquea.
- [x] Si un endpoint declara metadata, los guards validan cumplimiento.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/common/constants/authorization.constants.ts`
- `apps/api/src/common/guards/permissions.guard.ts`
- `apps/api/src/common/guards/roles.guard.ts`
- `apps/api/src/modules/app/app.module.ts`

## Pendientes no resueltos
- Conectar permisos/roles a identidad autenticada real en `T-0636` y `T-0637`.
