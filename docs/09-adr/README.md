# Architecture Decision Records (ADR)

## Objetivo

Registrar las decisiones de arquitectura de nivel 3+ (impacto transversal o de largo plazo) con su contexto, opciones consideradas, decision tomada y consecuencias.

## Cuando crear un ADR

Segun `docs/02-architecture/15-ownership-decisiones-tecnicas.md`:
- **Nivel 3 — Arquitectonico**: Cambio de stack, patron de integracion, nuevo modulo transversal.
- **Nivel 4 — Canon**: Cambio en principios o restricciones globales.

Nivel 1 (local) y Nivel 2 (de modulo) no requieren ADR.

## Formato de nombre de archivo

```
NNN-titulo-kebab-case.md
```

Ejemplos:
- `001-estructura-monorepo.md`
- `002-stack-tecnologico.md`
- `003-modular-monolith.md`
- `004-arquitectura-sync.md`

## Plantilla

Ver `docs/07-dev-workflow/templates/adr-template.md`

## Estado posible de un ADR

| Estado    | Descripcion                                        |
| --------- | -------------------------------------------------- |
| propuesto | Borrador, pendiente de revision                    |
| aprobado  | Decision tomada y activa                           |
| obsoleto  | Superado por otro ADR (referencia al nuevo)        |
| rechazado | Evaluado y descartado (documentado para historia)  |

## ADRs activos

| ID  | Titulo                          | Estado    | Task   |
| --- | ------------------------------- | --------- | ------ |
| 001 | Estructura del monorepo         | aprobado  | T-0336 |
| 002 | Stack tecnologico oficial       | aprobado  | T-0337 |
| 003 | Arquitectura modular monolith   | aprobado  | T-0338 |
| 004 | Arquitectura de sincronizacion  | aprobado  | T-0339 |
