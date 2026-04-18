# T-0035 - Definir criterios de “task terminada”

## Metadatos
- ID: `T-0035`
- Fase: `Fase 0`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir criterios formales para marcar una task como terminada.

## Alcance
- Documentar definición de task terminada.
- Definir checklist de cierre.
- Definir regla de pendientes no resueltos en registro general.

## Fuera de alcance
- Automatización del checklist en CI.
- Métricas de productividad por task.

## Dependencias
- `T-0034` cerrada.

## Criterios de aceptación
- [x] Criterios de cierre documentados.
- [x] Checklist de cierre definido.
- [x] Integración con registro general de pendientes.

## Validaciones
- Consistencia con modelo operativo de tasks.
- Consistencia con práctica de cierre por bloques.

## Pruebas
- Prueba documental de aplicabilidad a bloques cerrados.

## Riesgos
- Sin criterio uniforme, el estado “closed” pierde confiabilidad.

## Documentación a actualizar
- `docs/07-dev-workflow/02-criterios-task-terminada.md`
- `docs/07-dev-workflow/00-task-operating-model.md`
- `docs/07-dev-workflow/templates/task-detail-template.md`
- `docs/07-dev-workflow/task-pending-registry.md`

## Decisiones clave
- Cierre de task requiere checklist completo y evidencia explícita.
- Pendientes no resueltos deben registrarse en archivo general.

## Evidencia documental
- `docs/07-dev-workflow/02-criterios-task-terminada.md`
- `docs/07-dev-workflow/task-pending-registry.md`

## Pendientes para la siguiente task
- Iniciar `T-0036` (criterios de módulo terminado).

## Pendientes no resueltos
- Ninguno.

