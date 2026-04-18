# T-0531 - Crear seed de organization demo

## Metadatos
- ID: `T-0531`
- Fase: `Fase 5`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear seed idempotente para organización demo de Foundation.

## Alcance
- Definir `upsert` por `slug` para organización demo.
- Asegurar reactivación de datos base (`isActive`, `deletedAt`).
- Exponer `organizationId` para dependencias del pipeline.

## Fuera de alcance
- Seeds de branches o catálogos de módulos de negocio.

## Dependencias
- `T-0530` cerrada.

## Criterios de aceptación
- [x] Seed de organización implementado con `upsert`.
- [x] Integrado al orquestador principal de seeds.
- [x] Re-ejecución no duplica organizaciones.

## Validaciones
- Conteo en PostgreSQL: `organizations = 1` tras doble ejecución.

## Pruebas
- `pnpm --filter @atlasrep/api run db:seed` ejecutado 2 veces sin errores.

## Riesgos
- Sin organización base no se puede seedear RBAC multi-tenant.

## Documentación a actualizar
- `docs/02-architecture/34-prisma-migracion-foundation-y-seeds-core.md`
- `prisma/seeds/organizations.seed.ts`
- `prisma/seeds/index.ts`

## Evidencia documental
- `prisma/seeds/organizations.seed.ts`
- `prisma/seeds/index.ts`

## Pendientes no resueltos
- Ninguno.
