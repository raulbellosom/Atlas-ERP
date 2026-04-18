# T-0620 - Configurar módulo Notifications base

## Metadatos
- ID: `T-0620`
- Fase: `Fase 6`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar `NotificationsModule` base para consultas foundation de notificaciones y conteo de no leídas.

## Alcance
- Crear `NotificationsModule`, `NotificationsController`, `NotificationsService`.
- Crear `ListNotificationsQueryDto`.
- Exponer rutas:
  - `GET /api/v1/notifications`
  - `GET /api/v1/notifications/:id`
  - `GET /api/v1/notifications/user/:userId/unread-count`
- Integrar módulo en `AppModule`.

## Fuera de alcance
- Envío de notificaciones por canales externos (email/push).
- Gestión de plantillas y preferencias de notificación.

## Dependencias
- `T-0619` cerrada.
- Modelo `Notification` disponible desde Fase 5.

## Criterios de aceptación
- [x] Módulo `notifications` creado e importado.
- [x] Servicio Prisma con consultas de listado, detalle y conteo no leído.
- [x] DTO con filtros base (`organizationId`, `userId`, `source`, `channel`, `status`).
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/notifications/notifications.module.ts`
- `apps/api/src/modules/notifications/notifications.controller.ts`
- `apps/api/src/modules/notifications/notifications.service.ts`
- `apps/api/src/modules/notifications/dto/list-notifications.query.dto.ts`
- `apps/api/src/modules/app/app.module.ts`

## Pendientes no resueltos
- Integración de canales externos y reglas de delivery en fases posteriores.
