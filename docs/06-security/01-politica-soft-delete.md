# Política de Soft Delete

## ID de política
- Task origen: `T-0030`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir cuándo y cómo aplicar soft delete para preservar trazabilidad y cumplimiento en datos críticos.

## Principios
- Registros críticos de negocio/finanzas no se eliminan físicamente por defecto.
- Soft delete debe conservar contexto mínimo de auditoría.
- Recuperación controlada cuando el dominio lo permita.

## Reglas
- Campo estándar recomendado: `deleted_at` (null = activo).
- Operaciones de “eliminación” en datos sensibles deben mapearse a soft delete.
- Consultas de negocio deben excluir registros soft-deleted salvo casos administrativos.
- Restauración debe quedar auditada.

## Restricciones
- Hard delete solo por procesos administrativos explícitos y documentados.
- No permitir soft delete sin política de visibilidad y restauración definida.

