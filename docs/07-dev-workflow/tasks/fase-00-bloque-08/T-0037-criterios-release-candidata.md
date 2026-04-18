# T-0037 - Definir criterios de “release candidata”

## Metadatos
- ID: `T-0037`
- Fase: `Fase 0`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir criterios obligatorios para declarar una versión como release candidata.

## Alcance
- Documentar definición formal de release candidata.
- Definir checklist mínimo de release candidata.
- Definir restricciones para evitar promover versiones inestables.

## Fuera de alcance
- Automatización de pipelines de release.
- Estrategia de calendario de releases.

## Dependencias
- `T-0036` cerrada.

## Criterios de aceptación
- [x] Definición formal de release candidata documentada.
- [x] Checklist mínimo de release candidata documentado.
- [x] Restricciones para promoción de versiones inestables documentadas.

## Validaciones
- Consistencia con criterios de módulo terminado.
- Consistencia con prácticas de riesgo y rollback.

## Pruebas
- Prueba documental aplicada a un escenario de release de Fase 3.

## Riesgos
- Sin este criterio, se pueden promover versiones con defectos críticos y alto riesgo operativo.

## Documentación a actualizar
- `docs/07-dev-workflow/04-criterios-release-candidata.md`
- `docs/07-dev-workflow/README.md`

## Decisiones clave
- Release candidata exige estabilidad técnica y evidencia de validación.
- Sin plan de rollback no hay elegibilidad para RC.

## Evidencia documental
- `docs/07-dev-workflow/04-criterios-release-candidata.md`

## Pendientes para la siguiente task
- Iniciar `T-0038` (política de branches y PRs).

## Pendientes no resueltos
- Ninguno.
