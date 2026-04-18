# T-0049 - Definir estrategia de backlog continuo

## Metadatos
- ID: `T-0049`
- Fase: `Fase 0`
- Bloque: `Bloque 10`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir como se alimenta, mantiene y prioriza el backlog del proyecto a lo largo del tiempo, garantizando que el catalogo maestro permanezca como fuente de verdad operativa y que ninguna task se ejecute sin registro formal.

## Alcance
- Definir el catalogo maestro como unica fuente de verdad del backlog.
- Definir el proceso para agregar tasks nuevas (propuesta, ID, registro, aprobacion).
- Definir la cadencia de mantenimiento del catalogo.
- Definir el manejo de tasks descartadas y bugs/hotfixes urgentes.
- Definir restricciones sobre tasks generadas por IA.

## Fuera de alcance
- Herramientas de gestion de proyectos externas (Jira, Linear, etc.) si se adoptan en el futuro.
- Proceso de estimacion de esfuerzo de tasks (no se usa estimacion en este proyecto en fase inicial).
- Priorizacion por sprint formal (se adopta la cadencia de bloques de 5 tasks).

## Dependencias
- `T-0048` cerrada.
- Revision de tasks generadas por IA (`T-0046`): aplica a la adicion de tasks al backlog.

## Criterios de aceptacion
- [x] Catalogo maestro definido como unica fuente de verdad.
- [x] Proceso de 4 pasos para agregar tasks nuevas documentado.
- [x] Cadencia de mantenimiento del catalogo definida.
- [x] Manejo de tasks descartadas documentado (marcar, no eliminar).
- [x] Manejo de bugs y hotfixes urgentes documentado.
- [x] Restricciones sobre tasks generadas por IA documentadas.

## Validaciones
- El proceso es coherente con la cadencia de bloques de 5 definida en el modelo operativo de tasks.
- Las tasks descartadas se marcan con razon documentada para trazabilidad futura.

## Pruebas
- Prueba documental: verificar que el proceso de agregar tasks puede aplicarse sin ambiguedad al propio catalogo actual.

## Riesgos
- Sin proceso formal, el backlog se fragmenta (tareas en notas, correos, conversaciones) y se pierde trazabilidad.
- Tasks ejecutadas sin registro en el catalogo generan deuda de governance.

## Documentacion a actualizar
- `docs/07-dev-workflow/08-estrategia-backlog-continuo.md`
- `docs/07-dev-workflow/README.md`

## Decisiones clave
- El catalogo maestro es vinculante: ninguna task se ejecuta sin estar registrada.
- Las tasks descartadas se marcan como DESCARTADA, nunca se eliminan.
- Los bugs criticos de produccion se insertan al inicio del bloque activo con prioridad maxima.

## Evidencia documental
- `docs/07-dev-workflow/08-estrategia-backlog-continuo.md`

## Pendientes para la siguiente task
- Iniciar `T-0050` (cierre y aprobacion del marco maestro de governance).

## Pendientes no resueltos
- Ninguno.
