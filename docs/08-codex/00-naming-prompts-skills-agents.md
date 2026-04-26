# Convención de Naming para Prompts, Skills y Agents

## ID de convención
- Task origen: `T-0024`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Prompts
- Archivo en `kebab-case`.
- Prompt maestro con sufijo `-master-prompt.md`.
- Debe reflejar claramente el dominio objetivo (ejemplo: `architecture-master-prompt.md`).

## Skills
- Archivo en `kebab-case`.
- Skill con sufijo `-skill.md`.
- Nombre debe expresar capacidad concreta (ejemplo: `sync-policy-skill.md`).

## Agents
- Nombre canónico en `PascalCase` con sufijo `Agent`.
- Descripción corta de responsabilidad y límites de alcance.

## Restricciones
- Evitar nombres genéricos (`general-prompt`, `helper-skill`, `main-agent`).
- No mezclar responsabilidades incompatibles en un solo prompt/skill/agent.
- Mantener trazabilidad entre nombre y función real.

