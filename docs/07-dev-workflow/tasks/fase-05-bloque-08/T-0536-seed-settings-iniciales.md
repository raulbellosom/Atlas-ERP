# T-0536 - Crear seed de settings iniciales

## Metadatos
- ID: `T-0536`
- Fase: `Fase 5`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear seed idempotente de settings globales y por organización para baseline foundation.

## Alcance
- Definir settings globales (`locale`, `timezone`, `currency`, `sync`).
- Definir settings iniciales de organización demo.
- Resolver idempotencia de settings globales con `organizationId = null`.

## Fuera de alcance
- Motor de cache y refresco runtime de settings en API.

## Dependencias
- `T-0519` y `T-0531` cerradas.

## Criterios de aceptación
- [x] Seed de `Setting` implementado.
- [x] Integrado en `prisma/seeds/index.ts`.
- [x] Re-ejecución mantiene conteo estable y sin duplicados por scope+key.

## Validaciones
- Conteo estable tras reseed: `settings = 8`.
- Check SQL: `duplicate_setting_scope_key = 0`.

## Pruebas
- `db:seed` y `reset-db-reseed` ejecutados con resultado consistente.

## Riesgos
- Sin settings base no hay configuración inicial estable para entorno local.

## Documentación a actualizar
- `docs/02-architecture/35-prisma-seeds-foundation-feature-flags-settings.md`
- `prisma/seeds/settings.seed.ts`
- `prisma/seeds/index.ts`

## Evidencia documental
- `prisma/seeds/settings.seed.ts`
- `prisma/seeds/index.ts`

## Pendientes no resueltos
- Ninguno.
