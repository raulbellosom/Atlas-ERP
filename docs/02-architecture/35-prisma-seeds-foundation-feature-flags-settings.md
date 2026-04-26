# Seeds Foundation de Feature Flags y Settings

## Task de origen
- `T-0535` y `T-0536`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Objetivo
Completar seeds foundation con datos iniciales de `FeatureFlag` y `Setting` en forma idempotente y trazable.

## Entregables
- `prisma/seeds/feature-flags.seed.ts`
- `prisma/seeds/settings.seed.ts`
- `prisma/seeds/index.ts` (orquestación actualizada)

## Feature flags iniciales
- `financial.reconciliation.enabled`
- `sync.auto_retry.enabled`
- `desktop.offline_mode.enabled`
- `admin.bulk_operations.enabled`
- `notifications.in_app.enabled`

## Settings iniciales
- Globales (`organizationId = null`):
  - `platform.locale.default = es-MX`
  - `platform.timezone.default = America/Mexico_City`
  - `platform.currency.default = MXN`
  - `sync.batch.max_items = 100`
  - `sync.retry.max_attempts = 3`
- Por organización demo:
  - `organization.ui.brand_name = AtlasERP Demo`
  - `organization.sync.enabled = true`
  - `organization.audit.strict_mode = true`

## Reglas de implementación
- Seeds con `upsert` para entidades con unique formal (`FeatureFlag`, settings scoped por organización).
- Para settings globales (`organizationId = null`) se usa estrategia `findFirst + update/create` para garantizar idempotencia real en PostgreSQL.
- Re-ejecución no incrementa conteos.

## Validación aplicada
- `db:seed` ejecutado en ciclos repetidos sin duplicados.
- Conteos esperados estables:
  - `feature_flags = 5`
  - `settings = 8`

## Notas
- El catálogo de flags crece conforme se habiliten módulos de negocio.
- Settings de negocio avanzado se incorporan por módulo en fases posteriores.
