# T-0111 - Crear documento maestro de instrucciones globales para Codex

## Metadatos

- ID: `T-0111`
- Fase: `Fase 1`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`

## Objetivo

Ampliar y completar el documento CODEX_MASTER_INSTRUCTIONS.md con metadatos de task, stack completo, reglas globales, instrucciones por capa, referencias a agents/prompts/skills y prioridades.

## Alcance

- Agregar seccion de metadatos de origen de task.
- Agregar stack completo con versiones.
- Definir 20 reglas globales no negociables.
- Agregar instrucciones por capa (backend, frontend, desktop, sync, data, devops, qa).
- Agregar referencias cruzadas a agents, prompts y skills.
- Definir lista jerarquica de prioridades ante conflictos.

## Fuera de alcance

- Modificacion de los principios de arquitectura del canon.

## Dependencias

- `T-0110` cerrada.

## Criterios de aceptacion

- [x] Archivo existe en `docs/08-codex/CODEX_MASTER_INSTRUCTIONS.md`.
- [x] Contiene stack completo, reglas globales, instrucciones por capa y referencias.
- [x] Es coherente con todo el canon de Fase 0.

## Artefacto generado

- `docs/08-codex/CODEX_MASTER_INSTRUCTIONS.md` (actualizado)
