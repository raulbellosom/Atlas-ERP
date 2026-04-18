# Criterios de "Release Candidata"

## ID de criterio
- Task origen: `T-0037`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Definición
Una release candidata es una versión técnicamente estable, funcionalmente completa para su alcance y lista para validación final/UAT.

## Checklist mínimo de release candidata
- Alcance de release completamente implementado.
- Sin bugs bloqueantes conocidos.
- Pruebas críticas del alcance en estado aprobado.
- Migraciones y compatibilidad de datos validadas.
- Observabilidad mínima disponible (`logs`, `health`, trazabilidad).
- Documentación técnica y operativa actualizada.
- Plan de rollback definido y revisado.

## Restricciones
- No marcar release candidata con cambios sin versionar.
- No marcar release candidata sin validar riesgos críticos pendientes.
