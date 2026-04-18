# T-0533 - Crear seed de roles iniciales

## Metadatos
- ID: `T-0533`
- Fase: `Fase 5`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear seed idempotente de roles foundation por organización.

## Alcance
- Definir roles base: `admin`, `tesorero`, `auditor`.
- Implementar `upsert` por unique compuesto (`organizationId`, `name`).
- Asegurar consistencia de estado (`isActive`, `deletedAt`).

## Fuera de alcance
- Roles específicos de módulos productivos futuros.

## Dependencias
- `T-0531` cerrada.

## Criterios de aceptación
- [x] Seed de roles implementado.
- [x] Integrado al orquestador de seeds.
- [x] Re-ejecución no duplica roles por tenant.

## Validaciones
- Conteo en PostgreSQL: `roles = 3` tras doble seed.

## Pruebas
- `pnpm --filter @atlasrep/api run db:seed` exitoso.

## Riesgos
- Sin roles iniciales no puede validarse RBAC desde los primeros módulos backend.

## Documentación a actualizar
- `docs/02-architecture/34-prisma-migracion-foundation-y-seeds-core.md`
- `prisma/seeds/roles.seed.ts`
- `prisma/seeds/index.ts`

## Evidencia documental
- `prisma/seeds/roles.seed.ts`
- `prisma/seeds/index.ts`

## Pendientes no resueltos
- Ninguno.
