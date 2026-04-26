# Convenciones de Enums en Prisma

## Task de origen
- `T-0503` y `T-0529`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Convenciones
- Nombre de enum en `PascalCase` (`UserStatus`, `SyncItemState`).
- Valores en `SCREAMING_SNAKE_CASE` (`ACTIVE`, `INACTIVE`, `PENDING_REVIEW`).
- Enums deben representar estado de negocio estable, no valores temporales.
- Todo enum requiere descripción de uso en documentación de dominio.

## Enums foundation activos (Fase 5)
- `SourceType`
- `SyncSessionStatus`
- `SyncItemStatus`
- `ConflictStatus`
- `ConflictResolutionAction`
- `ConflictResolutionStatus`
- `SyncLogLevel`
- `SyncLogStatus`
- `NotificationChannel`
- `NotificationStatus`
- `SessionStatus`
- `RefreshTokenStatus`

## Reglas de evolución
- Evitar eliminar valores en uso sin migración de datos.
- Agregar valores nuevos de forma retrocompatible siempre que sea posible.
