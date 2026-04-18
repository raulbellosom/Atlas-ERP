# Convenciones Prisma para Nombres de Migraciones

## Task de origen
- `T-0508`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Formato oficial
`YYYYMMDDHHmm_descripcion_corta_snake_case`

Ejemplos:
- `202604131830_foundation_schema_base`
- `202604141015_add_user_role_relations`

## Reglas
- Usar verbo técnico claro (`add`, `alter`, `drop`, `rename`, `backfill`).
- No usar nombres genéricos (`update`, `changes`, `fix`).
- Mantener longitud razonable y semántica clara.

## Gobernanza
- Cambios potencialmente destructivos requieren referencia a ADR.
- Cada migración debe indicar impacto de rollback en documentación de task.

## Restricción
- Prohibido generar migraciones sin nombre descriptivo.
