# Migración Foundation Inicial y Seeds Core

## Task de origen
- `T-0530` a `T-0534`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Objetivo
Consolidar baseline de base de datos Foundation con migración inicial versionada y seeds idempotentes para organización demo, roles, permisos y usuarios iniciales.

## Entregables del bloque
- Migración inicial generada: `prisma/migrations/20260413031618_foundation_schema_initial/migration.sql`
- Lock de migraciones: `prisma/migrations/migration_lock.toml`
- Seeds modulares implementados:
  - `prisma/seeds/organizations.seed.ts`
  - `prisma/seeds/roles.seed.ts`
  - `prisma/seeds/permissions.seed.ts`
  - `prisma/seeds/users.seed.ts`
  - `prisma/seeds/index.ts` (orquestador)

## Datos seed foundation
- Organización demo: `AtlasERP Demo` (`atlaserp-demo`)
- Roles iniciales: `admin`, `tesorero`, `auditor`
- Permisos iniciales: 13 permisos base de core/auth/settings/feature flags/auditoría/sync
- Usuarios iniciales:
  - `admin@atlaserp.local`
  - `tesoreria@atlaserp.local`
  - `auditoria@atlaserp.local`

## Reglas aplicadas
- Seeds idempotentes mediante `upsert`.
- Asignación de roles a usuarios vía `UserRole`.
- Asignación de permisos a roles vía `RolePermission`.
- Reactivación explícita de registros base (`isActive = true`, `deletedAt = null`) al re-ejecutar seeds.

## Validación ejecutada
- `db:migrate:status`: schema al día.
- `db:seed`: ejecución correcta y repetible.
- Validación de conteos en PostgreSQL:
  - `organizations = 1`
  - `roles = 3`
  - `permissions = 13`
  - `users = 3`
  - `user_roles = 3`
  - `role_permissions = 26`

## Notas de alcance
- `feature flags` y `settings` se completan en `T-0535` y `T-0536` (ver `docs/02-architecture/35-prisma-seeds-foundation-feature-flags-settings.md`).
- Se mantiene advertencia de Prisma sobre deprecación de `package.json#prisma` para una fase posterior de upgrade.
