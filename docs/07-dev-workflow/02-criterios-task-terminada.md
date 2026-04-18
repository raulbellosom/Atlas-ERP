# Criterios de “Task Terminada”

## ID de criterio
- Task origen: `T-0035`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Definición de task terminada
Una task está terminada cuando cumple alcance, criterios de aceptación, validaciones y evidencia documental sin pendientes críticos abiertos.

## Checklist de cierre
- Dependencias cumplidas o no aplicables documentadas.
- Criterios de aceptación en estado cumplido.
- Documentación relacionada actualizada.
- Consistencia con canon y backlog verificada.
- Idioma/codificación correctos (`es-MX`, UTF-8).
- Evidencia documental explícita registrada.
- Pendientes no resueltos registrados en `task-pending-registry.md` si existen.

## Estados permitidos al cierre
- `closed` si no hay bloqueo.
- `blocked` si dependencia crítica impide cierre.

## Restricciones
- No marcar `closed` sin evidencia.
- No ocultar pendientes críticos fuera del registro general.

