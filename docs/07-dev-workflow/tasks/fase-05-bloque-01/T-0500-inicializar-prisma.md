# T-0500 - Inicializar Prisma

## Metadatos
- ID: `T-0500`
- Fase: `Fase 5`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Inicializar Prisma en el repositorio con una base de schema foundation.

## Alcance
- Crear `prisma/schema.prisma`.
- Alinear scripts de `apps/api` para usar schema central.
- Establecer dependencia oficial de Prisma Client y CLI.

## Fuera de alcance
- Modelado de entidades foundation (`T-0510+`).
- Migración inicial (`T-0530`).

## Dependencias
- `T-0429` cerrada (baseline de infraestructura local).

## Criterios de aceptación
- [x] Prisma inicializado con schema central.
- [x] Scripts DB del API apuntan al schema central.
- [x] Dependencias de Prisma definidas en `apps/api/package.json`.

## Validaciones
- `prisma/schema.prisma` existe y contiene `generator` + `datasource`.

## Pruebas
- `pnpm --filter @atlasrep/api exec prisma validate --schema ../../prisma/schema.prisma` → OK.
- `pnpm --filter @atlasrep/api run db:generate` → OK.

## Riesgos
- Sin schema central, migraciones y seeds se dispersan entre apps.

## Documentación a actualizar
- `docs/02-architecture/20-prisma-inicializacion.md`
- `docs/07-dev-workflow/tasks/fase-05-bloque-01/T-0500-inicializar-prisma.md`

## Evidencia documental
- `prisma/schema.prisma`
- `apps/api/package.json`
- `docs/02-architecture/20-prisma-inicializacion.md`

## Pendientes no resueltos
- Ninguno.
