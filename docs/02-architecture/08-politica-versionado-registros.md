# Política de Versionado de Registros

## ID de política
- Task origen: `T-0032`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir cómo versionar registros sensibles para mantener trazabilidad de cambios y compatibilidad operativa.

## Reglas
- Registros críticos deben permitir reconstrucción de cambios relevantes.
- Cambios estructurales o funcionales de datos deben quedar auditados.
- Versionado puede ser explícito por campo de versión o historial relacionado según módulo.
- En conflictos de sync, la versión debe ser insumo para resolución.

## Criterio mínimo
- Debe existir mecanismo para identificar versión vigente y cambios previos en registros críticos.

## Restricciones
- No sobrescribir silenciosamente datos sensibles sin traza.
- No introducir versionado inconsistente entre módulos que comparten entidad.

