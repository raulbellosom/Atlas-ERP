# Política de Commits y Convenciones

## ID de política
- Task origen: `T-0039`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir convención uniforme para mensajes de commit, granularidad de cambios y trazabilidad con tasks.

## Formato de mensaje
Formato recomendado:

`tipo(scope): resumen corto`

Ejemplos válidos:
- `docs(governance): cerrar T-0039 politica de commits`
- `feat(sync): agregar validacion de version local`
- `fix(api): corregir calculo de saldo acumulado`

## Tipos permitidos
- `feat`: nueva funcionalidad.
- `fix`: corrección de bug.
- `docs`: cambios documentales.
- `refactor`: reestructura sin cambio funcional.
- `test`: pruebas.
- `chore`: tareas operativas/tooling.

## Reglas de convención
- Cada commit debe representar un cambio coherente y atómico.
- Evitar commits masivos con cambios no relacionados.
- Referenciar ID de task en el mensaje de commit o en el PR asociado.
- Priorizar mensajes en español claro y orientados a intención de negocio/técnica.

## Restricciones
- Prohibido commit con mensaje genérico (`update`, `fix`, `cambios`).
- Prohibido mezclar cambios de múltiples tasks no relacionadas en un solo commit.
