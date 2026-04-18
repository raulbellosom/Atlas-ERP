# Convenciones Prisma de Soft Delete

## Task de origen
- `T-0506`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Alineación de diseño
- `docs/06-security/01-politica-soft-delete.md`
- `docs/08-codex/agents/prisma-data-agent.md`

## Convención oficial
- Campo estándar Prisma: `deletedAt DateTime?`.
- `null` significa registro activo.
- Valor con fecha significa registro eliminado lógicamente.

## Regla de uso
- Entidades críticas de negocio y auditoría usan soft delete por defecto.
- Hard delete solo en procesos administrativos explícitos y documentados.
- Listados de negocio deben excluir `deletedAt != null` por defecto.

## Integridad y auditoría
- Restauraciones deben quedar auditadas.
- No se permite reutilizar IDs de registros soft-deleted como si fueran nuevos.

## Restricción
- No introducir soft delete en modelos sin definir política de visibilidad y recuperación.
