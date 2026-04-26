# Política de Branches y PRs

## ID de política
- Task origen: `T-0038`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir flujo de trabajo de ramas y pull requests para mantener calidad, trazabilidad y control de riesgo en cambios del repositorio.

## Convención de ramas
- `main`: rama estable principal.
- `feature/<id-task>-<descripcion-corta>`
- `fix/<id-task>-<descripcion-corta>`
- `docs/<id-task>-<descripcion-corta>`
- `hotfix/<descripcion-corta>` (solo incidentes urgentes)

## Reglas de PR
- Todo cambio relevante entra por PR.
- El PR debe referenciar task(s) del backlog.
- El PR debe describir alcance, riesgos y validaciones ejecutadas.
- No mezclar cambios no relacionados en un mismo PR.
- Cambios de arquitectura o dominio deben incluir actualización documental.

## Restricciones
- Prohibido merge directo a `main` sin revisión.
- Prohibido PR sin trazabilidad a task o objetivo explícito.
