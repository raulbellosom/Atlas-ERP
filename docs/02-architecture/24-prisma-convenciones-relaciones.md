# Convenciones de Relaciones en Prisma

## Task de origen
- `T-0504`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Convenciones
- Relaciones explícitas con `@relation` cuando exista ambigüedad.
- Campos FK en `camelCase` y con sufijo `Id` (`organizationId`, `createdById`).
- Múltiples relaciones entre mismos modelos deben nombrarse.
- Definir `onDelete` y `onUpdate` de forma explícita en relaciones críticas.

## Integridad
- Preferencia por integridad referencial fuerte en base de datos.
- No usar relaciones implícitas que oculten ownership funcional.
