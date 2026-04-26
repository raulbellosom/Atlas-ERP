# Baseline y Aprobación de Foundation Schema v1

## Task de origen
- `T-0538`, `T-0539`, `T-0540`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Alcance del baseline v1
Foundation data layer completada en Fase 5 (`T-0500` a `T-0540`) con:
- Schema Prisma versionado
- Migración inicial aplicada y reproducible
- Seeds foundation activos e idempotentes
- Convenciones de enums, relaciones, índices, soft delete y timestamps aplicadas

## Inventario principal de Foundation
- Core Platform: `Organization`, `Branch`, `User`, `Role`, `Permission`, `UserRole`, `RolePermission`
- Operación transversal: `AuditLog`, `Attachment`, `Setting`, `FeatureFlag`
- Sync Center base: `DeviceRegistry`, `SyncSession`, `SyncItem`, `ConflictRecord`, `ConflictResolution`, `SyncLog`
- Auth/session base: `Session`, `RefreshToken`
- Notificaciones base: `Notification`

## Enums globales v1
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

## Evidencia técnica de integridad
- Migraciones:
  - `prisma/migrations/20260413031618_foundation_schema_initial/migration.sql`
  - `prisma/migrations/migration_lock.toml`
- Validaciones Prisma:
  - `prisma validate` OK
  - `db:generate` OK
  - `db:migrate:status` OK
- Seeds:
  - `db:seed` repetible e idempotente
  - `tools/reset-db-reseed.sh` probado en Windows
- Checks SQL de integridad:
  - `orphan_user_roles = 0`
  - `orphan_role_permissions = 0`
  - `duplicate_feature_flag_key = 0`
  - `duplicate_setting_scope_key = 0`

## Resultado de aprobación
- Foundation schema **v1 APROBADO** para habilitar Fase 6 (Backend foundation).
- Riesgos residuales conocidos:
  - Aviso deprecado de Prisma sobre `package.json#prisma` (planificar migración a `prisma.config.ts`).
  - Dependencias base de NestJS aún pendientes en `apps/api` (fuera de Fase 5).
