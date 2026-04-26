# Conexión Prisma con PostgreSQL

## Task de origen
- `T-0501`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Objetivo
Alinear Prisma con PostgreSQL del entorno Docker local.

## Configuración oficial
- `provider`: `postgresql`
- `url`: `env("DATABASE_URL")`

## URL base de desarrollo
`postgresql://atlaserp:atlaserp_dev@localhost:5432/atlaserp_dev`

## Reglas
- `DATABASE_URL` es obligatoria.
- La conexión se valida con comandos Prisma (`validate`, `migrate status`, `generate`).
- No se hardcodean credenciales fuera de `.env`/secret manager.

