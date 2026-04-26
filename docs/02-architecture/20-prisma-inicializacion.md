# Inicialización de Prisma en AtlasERP

## Task de origen
- `T-0500`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Resultado
Se inicializó Prisma para el monorepo con un `schema.prisma` central en `prisma/schema.prisma`.

## Decisiones
- Se usa **schema central** en la raíz del repo para simplificar migraciones y seeds compartidos.
- Los scripts de `apps/api` apuntan explícitamente a `../../prisma/schema.prisma`.

## Estructura inicial
- `prisma/schema.prisma`
- `prisma/migrations/`
- `prisma/seeds/index.ts`

## Criterio de aceptación
- Existe schema Prisma válido con `generator client` y `datasource db`.
- Scripts Prisma de `apps/api` funcionan con schema central.
