# T-0611 - Configurar módulo Users

## Metadatos
- ID: `T-0611`
- Fase: `Fase 6`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar el módulo `Users` con endpoints de consulta foundation conectados a Prisma para habilitar consumo controlado de usuarios.

## Alcance
- Crear `UsersModule`, `UsersController`, `UsersService`.
- Crear `ListUsersQueryDto`.
- Exponer rutas:
  - `GET /api/v1/users`
  - `GET /api/v1/users/:id`
  - `GET /api/v1/users/organization/:organizationId/active-count`
- Consultas con filtros base (`organizationId`, `includeInactive`) y soft delete.

## Fuera de alcance
- Endpoints de alta/edición/baja de usuarios.
- Reglas de autorización por permisos y scoping avanzado.

## Dependencias
- `T-0610` cerrada.
- Modelo `User` foundation disponible desde Fase 5.

## Criterios de aceptación
- [x] Módulo `users` creado e importado en `AppModule`.
- [x] Servicio conectado a Prisma (`user.findMany`, `user.findFirst`, `user.count`).
- [x] DTO de consulta validado por `ValidationPipe` global.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/users/users.module.ts`
- `apps/api/src/modules/users/users.controller.ts`
- `apps/api/src/modules/users/users.service.ts`
- `apps/api/src/modules/users/dto/list-users.query.dto.ts`
- `apps/api/src/modules/app/app.module.ts`

## Pendientes no resueltos
- Ninguno.
