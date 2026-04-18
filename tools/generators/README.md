# tools/generators/

## Objetivo

Centralizar los generadores de codigo y scaffolding reutilizables del monorepo AtlasERP.

## Generadores planificados

Estos scripts se implementan en fases posteriores (Fase 6+) cuando los modulos base esten listos.

| Script                    | Descripcion                                          | Fase  |
| ------------------------- | ---------------------------------------------------- | ----- |
| `scaffold-module.sh`      | Genera un modulo NestJS completo (controller+service+dto+test) | Fase 6 |
| `scaffold-page.sh`        | Genera una pagina React con su hook y llamada a API  | Fase 6 |
| `scaffold-blueprint.sh`   | Genera un blueprint de dominio desde template        | Fase 3 |
| `scaffold-adr.sh`         | Genera un ADR numerado desde el template             | Fase 3 |

## Uso (cuando esten disponibles)

```bash
# Desde la raiz del monorepo:
bash tools/generators/scaffold-module.sh <nombre-modulo>
bash tools/generators/scaffold-page.sh <nombre-pagina>
```

## Referencia

- Templates en: `docs/07-dev-workflow/templates/`
- Skill de scaffolding: `docs/08-codex/skills/module-scaffold-skill.md`
