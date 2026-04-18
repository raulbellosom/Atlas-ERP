# T-0624 - Configurar decorators de permisos

## Metadatos
- ID: `T-0624`
- Fase: `Fase 6`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Definir decoradores reutilizables de permisos para habilitar autorización declarativa por endpoint o controlador.

## Alcance
- Crear `RequireAllPermissions(...permissions)`.
- Crear `RequireAnyPermission(...permissions)`.
- Vincular decorators a metadata consumida por `PermissionsGuard`.

## Fuera de alcance
- Aplicación masiva de decorators a todos los endpoints existentes.
- Mapeo final de permisos por módulo de negocio.

## Dependencias
- `T-0623` cerrada.

## Criterios de aceptación
- [x] Decoradores de permisos creados en `common/decorators`.
- [x] Integración con metadata keys de autorización.
- [x] Compatibles con `PermissionsGuard` global.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/common/decorators/permissions.decorator.ts`
- `apps/api/src/common/constants/authorization.constants.ts`
- `apps/api/src/common/guards/permissions.guard.ts`

## Pendientes no resueltos
- Aplicar decorators de permisos en endpoints de negocio conforme avance Fase 6 (`T-0639+`).
