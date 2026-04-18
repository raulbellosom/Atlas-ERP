# Agents de AtlasERP

## Índice de agents

| #   | Agent                | Archivo                            | Responsabilidad                                    |
| --- | -------------------- | ---------------------------------- | -------------------------------------------------- |
| 1   | SystemArchitectAgent | `agents/system-architect-agent.md` | Arquitectura global, ADRs, estructura de monorepo  |
| 2   | DomainBlueprintAgent | `agents/domain-blueprint-agent.md` | Blueprints funcionales y técnicos de dominio       |
| 3   | PrismaDataAgent      | `agents/prisma-data-agent.md`      | Schema Prisma, migraciones, seeds, modelos         |
| 4   | BackendAPIAgent      | `agents/backend-api-agent.md`      | Módulos NestJS, servicios, endpoints, DTOs         |
| 5   | FrontendWebAgent     | `agents/frontend-web-agent.md`     | App React, páginas, componentes, UX                |
| 6   | DesktopAgent         | `agents/desktop-agent.md`          | Shell Tauri, SQLite, bridges nativos               |
| 7   | SyncEngineAgent      | `agents/sync-engine-agent.md`      | Motor de sync, cola local, conflictos, Sync Center |
| 8   | DevOpsCIAgent        | `agents/devops-ci-agent.md`        | Docker, CI/CD, ambientes, backups, deploy          |
| 9   | QAContractsAgent     | `agents/qa-contracts-agent.md`     | Testing, matrices de escenarios, calidad           |
| 10  | DesignSystemAgent    | `agents/design-system-agent.md`    | Design tokens, componentes UI base, accesibilidad  |
| 11  | DocumentationAgent   | `agents/documentation-agent.md`    | Documentación, canon, READMEs, ADRs, índices       |

## Convenciones

- Nombre canónico en `PascalCase` con sufijo `Agent`.
- Archivo en `kebab-case` con sufijo `-agent.md`.
- Cada agent tiene: responsabilidad, alcance, fuera de alcance, interacciones, restricciones.
