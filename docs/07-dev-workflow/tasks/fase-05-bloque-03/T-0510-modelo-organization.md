# T-0510 - Crear modelo Organization

## Metadatos
- ID: `T-0510`
- Fase: `Fase 5`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear el modelo `Organization` como tenant raíz del sistema.

## Alcance
- Definir estructura base de `Organization`.
- Definir relación con entidades hijas (`Branch`, `User`, `Role`).
- Definir constraints e índices mínimos.

## Fuera de alcance
- Seeds de organizaciones (`T-0531`).

## Dependencias
- `T-0509` cerrada.

## Criterios de aceptación
- [x] Modelo `Organization` implementado en `schema.prisma`.
- [x] Constraint de unicidad para `slug`.
- [x] Campos de soft delete y timestamps definidos.

## Validaciones
- `pnpm --filter @atlasrep/api exec prisma validate --schema ../../prisma/schema.prisma` → OK.

## Pruebas
- `pnpm --filter @atlasrep/api run db:generate` → OK.

## Riesgos
- Sin tenant raíz, se rompe la estrategia multi-tenant del Core Platform.

## Documentación a actualizar
- `docs/02-architecture/30-prisma-modelos-foundation-core-platform.md`
- `prisma/schema.prisma`

## Evidencia documental
- `prisma/schema.prisma`
- `docs/02-architecture/30-prisma-modelos-foundation-core-platform.md`

## Pendientes no resueltos
- Ninguno.
