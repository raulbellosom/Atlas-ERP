# T-0501 - Conectar Prisma a PostgreSQL

## Metadatos
- ID: `T-0501`
- Fase: `Fase 5`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Conectar Prisma al contenedor PostgreSQL local mediante `DATABASE_URL`.

## Alcance
- Definir datasource PostgreSQL en schema.
- Documentar URL base de desarrollo.
- Validar conexión base por comandos Prisma.

## Fuera de alcance
- Migraciones de modelos foundation.

## Dependencias
- `T-0500` cerrada.

## Criterios de aceptación
- [x] Datasource PostgreSQL definido con `env("DATABASE_URL")`.
- [x] Documentación de conexión base publicada.
- [x] Validación de CLI Prisma ejecutada.

## Validaciones
- Scripts de `db:*` del API usan `--schema ../../prisma/schema.prisma`.

## Pruebas
- `pnpm --filter @atlasrep/api exec prisma validate --schema ../../prisma/schema.prisma` → OK.
- `pnpm --filter @atlasrep/api exec prisma db pull --schema ../../prisma/schema.prisma` → conexión correcta; resultado esperado `P4001` por base vacía (sin tablas todavía).

## Riesgos
- Si `DATABASE_URL` no existe, no se podrán ejecutar migraciones/seed.

## Documentación a actualizar
- `docs/02-architecture/21-prisma-postgresql.md`

## Evidencia documental
- `prisma/schema.prisma`
- `docs/02-architecture/21-prisma-postgresql.md`

## Pendientes no resueltos
- Ninguno.

