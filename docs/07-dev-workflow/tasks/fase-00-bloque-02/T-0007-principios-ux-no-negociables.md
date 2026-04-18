# T-0007 - Definir principios UX no negociables

## Metadatos
- ID: `T-0007`
- Fase: `Fase 0`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir principios obligatorios de experiencia de usuario para garantizar consistencia y calidad mínima de interfaces.

## Alcance
- Consolidar principios UX en canon.
- Declarar estados mínimos obligatorios por pantalla.
- Definir criterio de cumplimiento.

## Fuera de alcance
- Diseño visual detallado de cada módulo.
- Implementación de componentes UI concretos.

## Dependencias
- `T-0006` cerrada.

## Criterios de aceptación
- [x] Documento canon UX actualizado y explícito.
- [x] Estados mínimos por pantalla definidos.
- [x] Criterio de cumplimiento definido.

## Validaciones
- Consistencia con reglas maestras del proyecto.
- Consistencia con estrategia de Sync Center visible.

## Pruebas
- Prueba documental de consistencia con `docs-08-codex-CODEX_MASTER_INSTRUCTIONS.md`.

## Riesgos
- Omisión de estados mínimos produce UX inconsistente y errores operativos.

## Documentación a actualizar
- `docs/00-canon/05_ui_principles.md`

## Decisiones clave
- Se mantienen React, Vite, JavaScript y TailwindCSS 4.1 como base UX técnica.
- Se mantiene prohibición de Bootstrap.
- Se formaliza que toda pantalla debe contemplar loading/empty/error/offline/sync pending.

## Evidencia documental
- `docs/00-canon/05_ui_principles.md`

## Pendientes para la siguiente task
- Definir principios de sincronización no negociables (`T-0008`).

