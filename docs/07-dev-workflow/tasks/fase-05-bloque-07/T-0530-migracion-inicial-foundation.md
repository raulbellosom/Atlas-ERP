# T-0530 - Generar migración inicial foundation

## Metadatos
- ID: `T-0530`
- Fase: `Fase 5`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Generar la migración inicial versionada del schema foundation en Prisma.

## Alcance
- Generar carpeta de migración bajo `prisma/migrations/` con nombre descriptivo.
- Versionar SQL inicial completo del schema foundation.
- Aplicar migración para validar consistencia de ejecución.

## Fuera de alcance
- Migraciones incrementales de módulos de negocio futuros.

## Dependencias
- `T-0529` cerrada.

## Criterios de aceptación
- [x] Migración inicial creada en `prisma/migrations`.
- [x] `migration_lock.toml` presente para provider PostgreSQL.
- [x] `db:migrate:status` reporta schema al día.

## Validaciones
- `pnpm --filter @atlasrep/api run db:migrate:status` sin drift.

## Pruebas
- `pnpm --filter @atlasrep/api run db:migrate:prod` exitoso.

## Riesgos
- Sin migración inicial versionada no hay baseline reproducible entre ambientes.

## Documentación a actualizar
- `docs/02-architecture/34-prisma-migracion-foundation-y-seeds-core.md`
- `prisma/migrations/*`

## Evidencia documental
- `prisma/migrations/20260413031618_foundation_schema_initial/migration.sql`
- `prisma/migrations/migration_lock.toml`

## Pendientes no resueltos
- Ninguno.
