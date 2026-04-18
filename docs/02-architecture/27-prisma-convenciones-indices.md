# Convenciones Prisma de Índices

## Task de origen
- `T-0507`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Alineación de diseño
- `docs/08-codex/prompts/prisma-data-master-prompt.md`
- `docs/04-modules/03-nomenclatura-entidades-tablas.md`

## Principios
- Todo índice debe responder a un patrón real de consulta.
- Priorizar índices por tenant (`organizationId`) y estado cuando aplique.
- Evitar sobreindexación que degrade escrituras.

## Convenciones
- Índices simples:
  - campos de búsqueda frecuente (`code`, `status`, `date`).
- Índices compuestos:
  - combinaciones de filtros comunes (`organizationId`, `status`, `createdAt`).
- Restricciones únicas:
  - usar `@@unique` en claves naturales de negocio.

## Regla de documentación
- Cada índice nuevo debe documentar:
  - consulta objetivo
  - impacto esperado
  - costo de mantenimiento

## Restricción
- Prohibido agregar índices sin justificar caso de uso.
