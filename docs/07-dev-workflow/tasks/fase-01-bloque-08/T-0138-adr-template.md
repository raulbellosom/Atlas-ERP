# T-0138 - Crear plantilla estandar para ADRs/decisiones arquitectonicas

## Metadatos

- ID: `T-0138`
- Fase: `Fase 1`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`

## Objetivo

Crear la plantilla estandar para Architecture Decision Records con opciones, consecuencias y reversibilidad.

## Alcance

- Definir estructura de ADR.
- Incluir secciones: contexto, opciones evaluadas, decision, consecuencias, reversibilidad.
- Hacer la plantilla usable por el SystemArchitectAgent.

## Fuera de alcance

- Creacion de ADRs concretos (la carpeta ADR se crea en Fase 3).

## Dependencias

- `T-0137` cerrada.

## Criterios de aceptacion

- [x] Archivo existe en `docs/07-dev-workflow/templates/adr-template.md`.
- [x] Contiene contexto, opciones, decision, consecuencias y reversibilidad.

## Artefacto generado

- `docs/07-dev-workflow/templates/adr-template.md` (nuevo)
