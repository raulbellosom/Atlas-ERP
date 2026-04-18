# Codex Docs

## Objetivo

Centralizar las definiciones del sistema de trabajo con IA: agents, prompts, skills, instructions y convenciones.

## Índice

- `00-naming-prompts-skills-agents.md` — Convenciones de naming
- `CODEX_MASTER_INSTRUCTIONS.md` — Instrucciones globales maestras
- `agents.md` — Índice de agents

### Agents (`agents/`)

- `system-architect-agent.md` — Arquitectura global, ADRs, monorepo
- `domain-blueprint-agent.md` — Blueprints de dominio
- `prisma-data-agent.md` — Schema Prisma, migraciones, seeds
- `backend-api-agent.md` — Módulos NestJS, servicios, endpoints
- `frontend-web-agent.md` — App React, páginas, componentes
- `desktop-agent.md` — Shell Tauri, SQLite, bridges
- `sync-engine-agent.md` — Motor de sync, cola, conflictos
- `devops-ci-agent.md` — Docker, CI/CD, deploy
- `qa-contracts-agent.md` — Testing, calidad
- `design-system-agent.md` — Design tokens, componentes UI
- `documentation-agent.md` — Documentación, canon, READMEs

### Prompts (`prompts/`)

- `architecture-master-prompt.md` — Prompt de arquitectura
- `backend-master-prompt.md` — Prompt de backend NestJS
- `frontend-master-prompt.md` — Prompt de frontend React
- `desktop-master-prompt.md` — Prompt de desktop Tauri
- `sync-master-prompt.md` — Prompt de sincronización
- `prisma-data-master-prompt.md` — Prompt de Prisma/data
- `documentation-master-prompt.md` — Prompt de documentación
- `testing-master-prompt.md` — Prompt de testing
- `devops-master-prompt.md` — Prompt de DevOps

### Skills (`skills/`)

- `module-scaffold-skill.md` — Scaffolding de módulos
- `blueprint-generation-skill.md` — Generación de blueprints
- `prisma-model-skill.md` — Modelos Prisma
- `endpoint-creation-skill.md` — Creación de endpoints
- `frontend-screen-skill.md` — Pantallas frontend
- `forms-validations-skill.md` — Formularios y validaciones
- `tables-listings-skill.md` — Tablas y listados
- `audit-skill.md` — Auditoría
- `sync-policy-skill.md` — Sync policy
- `conflict-resolution-skill.md` — Resolución de conflictos
- `sqlite-local-skill.md` — SQLite local
- `unit-testing-skill.md` — Pruebas unitarias
- `e2e-testing-skill.md` — Pruebas E2E
- `documentation-update-skill.md` — Actualización de documentación

### Instructions (`instructions/`)

- `README.md` — Propósito y convenciones (carpeta preparada para fases técnicas)
