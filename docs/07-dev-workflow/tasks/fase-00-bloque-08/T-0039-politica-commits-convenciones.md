# T-0039 - Definir política de commits y convenciones

## Metadatos
- ID: `T-0039`
- Fase: `Fase 0`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir una convención uniforme de commits para mejorar legibilidad histórica y trazabilidad técnica.

## Alcance
- Definir formato estándar de mensaje de commit.
- Definir tipos permitidos de commit.
- Definir reglas de granularidad y relación con tasks.

## Fuera de alcance
- Reglas de squash/rebase por repositorio.
- Automatización con commit hooks.

## Dependencias
- `T-0038` cerrada.

## Criterios de aceptación
- [x] Formato estándar de commit documentado.
- [x] Tipos permitidos documentados.
- [x] Reglas de granularidad y trazabilidad documentadas.

## Validaciones
- Consistencia con política de ramas y PRs.
- Consistencia con revisión de cambios por task.

## Pruebas
- Prueba documental con ejemplos de commits válidos e inválidos.

## Riesgos
- Sin convención uniforme, se pierde contexto histórico y se complica auditoría técnica.

## Documentación a actualizar
- `docs/07-dev-workflow/06-politica-commits-convenciones.md`
- `docs/07-dev-workflow/README.md`

## Decisiones clave
- Se adopta formato `tipo(scope): resumen corto`.
- Todo commit debe mantener relación explícita con una task o un objetivo técnico.

## Evidencia documental
- `docs/07-dev-workflow/06-politica-commits-convenciones.md`

## Pendientes para la siguiente task
- Iniciar `T-0040` (estrategia de environment variables).

## Pendientes no resueltos
- Ninguno.
