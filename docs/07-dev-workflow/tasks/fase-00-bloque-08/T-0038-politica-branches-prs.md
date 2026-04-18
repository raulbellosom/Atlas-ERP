# T-0038 - Definir política de branches y PRs

## Metadatos
- ID: `T-0038`
- Fase: `Fase 0`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir política oficial de ramas y pull requests para asegurar calidad y trazabilidad en cambios.

## Alcance
- Definir convención de nombres de ramas.
- Definir reglas mínimas de PR.
- Definir restricciones para proteger `main`.

## Fuera de alcance
- Configuración técnica del proveedor de repositorio.
- Automatización de checks obligatorios en CI.

## Dependencias
- `T-0037` cerrada.

## Criterios de aceptación
- [x] Convención de ramas documentada.
- [x] Reglas mínimas de PR documentadas.
- [x] Restricciones de merge a `main` documentadas.

## Validaciones
- Consistencia con trazabilidad por task.
- Consistencia con modelo de trabajo por bloques.

## Pruebas
- Prueba documental de mapeo de cambios a branch/PR/task.

## Riesgos
- Sin política de ramas, se incrementa el riesgo de cambios no revisados en producción.

## Documentación a actualizar
- `docs/07-dev-workflow/05-politica-branches-prs.md`
- `docs/07-dev-workflow/README.md`

## Decisiones clave
- Flujo de integración normal mediante PR.
- `main` se protege contra cambios directos sin revisión.

## Evidencia documental
- `docs/07-dev-workflow/05-politica-branches-prs.md`

## Pendientes para la siguiente task
- Iniciar `T-0039` (política de commits y convenciones).

## Pendientes no resueltos
- Ninguno.
