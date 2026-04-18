# T-0024 - Definir convención de naming para prompts, skills y agents

## Metadatos
- ID: `T-0024`
- Fase: `Fase 0`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir naming consistente para artefactos de trabajo asistido por IA (prompts, skills y agents).

## Alcance
- Definir convención de nombres para prompts.
- Definir convención de nombres para skills.
- Definir convención de nombres para agents.

## Fuera de alcance
- Rediseño del contenido de prompts/skills existentes.
- Implementación de validadores automáticos de naming.

## Dependencias
- `T-0023` cerrada.

## Criterios de aceptación
- [x] Convención de naming de prompts/skills/agents documentada.
- [x] Restricciones para evitar nombres genéricos definidas.
- [x] Referencia integrada en instrucciones de codex.

## Validaciones
- Consistencia con estructura actual en `docs/08-codex`.
- Consistencia con reglas de documentación del proyecto.

## Pruebas
- Prueba documental de alineación entre naming y función declarada.

## Riesgos
- Naming ambiguo en artefactos IA afecta mantenibilidad de operación asistida.

## Documentación a actualizar
- `docs/08-codex/00-naming-prompts-skills-agents.md`
- `docs/08-codex/README.md`
- `docs/08-codex/CODEX_MASTER_INSTRUCTIONS.md`
- `docs-08-codex-CODEX_MASTER_INSTRUCTIONS.md`

## Decisiones clave
- Prompts: `*-master-prompt.md`.
- Skills: `*-skill.md`.
- Agents: `PascalCase` + `Agent`.

## Evidencia documental
- `docs/08-codex/00-naming-prompts-skills-agents.md`

## Pendientes para la siguiente task
- Definir idioma principal e i18n (`T-0025`).

