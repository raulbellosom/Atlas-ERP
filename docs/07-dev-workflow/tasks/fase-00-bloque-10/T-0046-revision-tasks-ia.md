# T-0046 - Definir estrategia de revision de tasks generadas por IA

## Metadatos
- ID: `T-0046`
- Fase: `Fase 0`
- Bloque: `Bloque 10`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir como se revisan, validan y aprueban las tasks, documentos y codigo generados con asistencia de IA, garantizando calidad y coherencia con el canon antes de aceptarlos como parte oficial del proyecto.

## Alcance
- Definir que tipos de salida de IA siempre requieren revision humana.
- Definir checklist de revision minima para documentos generados por IA.
- Definir checklist de revision minima para codigo generado por IA.
- Definir responsable de la revision y momento en que ocurre.

## Fuera de alcance
- Evaluacion de herramientas de IA especificas (Claude, Codex, Copilot, etc.).
- Configuracion de agentes o prompts del proyecto (cubierto en Fase 1).
- Auditoria de uso de IA (tema de seguridad avanzada).

## Dependencias
- `T-0045` cerrada (ownership de decisiones tecnicas: define niveles de decision que aplican tambien a salidas de IA).

## Criterios de aceptacion
- [x] Tipos de salida que siempre requieren revision definidos.
- [x] Tipos que pueden aceptarse con revision ligera definidos.
- [x] Checklist de revision de documentos documentado.
- [x] Checklist de revision de codigo documentado.
- [x] Responsable y momento de revision definidos.
- [x] Restriccion de auto-aprobacion de tasks por IA documentada.

## Validaciones
- La checklist de documentos es coherente con los requisitos de UTF-8, kebab-case y canon.
- La checklist de codigo es coherente con las convenciones de naming y seguridad del proyecto.

## Pruebas
- Prueba documental: aplicar la checklist al propio documento generado por esta task y verificar que pasa.

## Riesgos
- Sin proceso de revision, la IA puede generar contenido que contradiga el canon o introduzca inconsistencias.
- Las tasks marcadas como cerradas por IA sin revision real generan deuda de governance oculta.

## Documentacion a actualizar
- `docs/07-dev-workflow/07-revision-tasks-ia.md`
- `docs/07-dev-workflow/README.md`

## Decisiones clave
- La IA no puede auto-aprobar tasks de Nivel 3 o superior.
- La revision ocurre antes de cerrar la task, no despues.
- El desarrollador que solicito la generacion es el responsable de la revision.

## Evidencia documental
- `docs/07-dev-workflow/07-revision-tasks-ia.md`

## Pendientes para la siguiente task
- Iniciar `T-0047` (politica de cambios retrocompatibles).

## Pendientes no resueltos
- Ninguno.
