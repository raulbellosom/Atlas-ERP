# T-0612 - Configurar módulo Roles

## Metadatos
- ID: `T-0612`
- Fase: `Fase 6`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar el módulo `Roles` con endpoints de consulta foundation y métricas básicas por rol para preparar autorización granular.

## Alcance
- Crear `RolesModule`, `RolesController`, `RolesService`.
- Crear `ListRolesQueryDto`.
- Exponer rutas:
  - `GET /api/v1/roles`
  - `GET /api/v1/roles/:id`
- Incluir conteos (`permissionCount`, `userCount`) por rol usando `_count`.

## Fuera de alcance
- Asignación de roles a usuarios.
- Gestión de permisos por rol vía endpoints de escritura.

## Dependencias
- `T-0611` cerrada.
- Modelos `Role`, `UserRole`, `RolePermission` disponibles desde Fase 5.

## Criterios de aceptación
- [x] Módulo `roles` creado e importado en `AppModule`.
- [x] Servicio Prisma con consultas y mapeo a `RoleSummary`.
- [x] DTO de filtros base (`organizationId`, `includeInactive`) operativo.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/roles/roles.module.ts`
- `apps/api/src/modules/roles/roles.controller.ts`
- `apps/api/src/modules/roles/roles.service.ts`
- `apps/api/src/modules/roles/dto/list-roles.query.dto.ts`
- `apps/api/src/modules/app/app.module.ts`

## Pendientes no resueltos
- Ninguno.
