# T-0006 - Definir principios arquitectónicos no negociables

## Metadatos
- ID: `T-0006`
- Fase: `Fase 0`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Formalizar los principios arquitectónicos obligatorios que gobiernan decisiones técnicas de AtlasERP v1.

## Alcance
- Consolidar principios en documento canon de arquitectura.
- Declarar su carácter no negociable.
- Definir criterio de cumplimiento.

## Fuera de alcance
- Implementación de arquitectura técnica en código.
- Selección de herramientas de infraestructura de detalle.

## Dependencias
- `T-0001` a `T-0005` cerradas.

## Criterios de aceptación
- [x] Documento canon de arquitectura actualizado con carácter no negociable.
- [x] Principios listados y claros.
- [x] Criterio de cumplimiento definido.

## Validaciones
- Consistencia con `CODEX_START_HERE.md`.
- Consistencia con backlog maestro en Fase 0.

## Pruebas
- Prueba documental de trazabilidad contra backlog y canon.

## Riesgos
- Interpretación ambigua de principios si no se mantiene el criterio de cumplimiento.

## Documentación a actualizar
- `docs/00-canon/01_architecture_principles.md`

## Decisiones clave
- Se ratifica modular monolith como base inicial.
- Se ratifica servidor como fuente oficial de verdad.
- Se ratifica offline parcial controlado con revisión de diferencias.

## Evidencia documental
- `docs/00-canon/01_architecture_principles.md`

## Pendientes para la siguiente task
- Definir principios UX no negociables (`T-0007`).

