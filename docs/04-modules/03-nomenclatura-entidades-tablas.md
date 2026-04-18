# Nomenclatura de Entidades y Tablas

## ID de convención
- Task origen: `T-0019`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Convención para entidades de dominio
- Nombre de entidad: `PascalCase` singular.
- Nombre de propiedad: `camelCase`.
- No usar prefijos de módulo dentro del nombre si el contexto de módulo ya existe.

## Convención para tablas relacionales
- Nombre de tabla: `snake_case` en singular.
- Llave primaria estándar: `id`.
- Llaves foráneas: `<entidad>_id` en `snake_case`.
- Campos temporales estándar: `created_at`, `updated_at`, `deleted_at` (si aplica soft delete).

## Convención para enums (cuando aplique)
- Nombre de enum en código: `PascalCase`.
- Valores persistidos: `snake_case` o `UPPER_SNAKE_CASE` según contrato definido por módulo, manteniendo consistencia interna.

## Restricciones
- Evitar nombres ambiguos o genéricos (`data`, `info`, `temp`).
- Evitar pluralización inconsistente entre entidades y tablas.
- Toda entidad nueva debe mapearse a ownership de módulo.

