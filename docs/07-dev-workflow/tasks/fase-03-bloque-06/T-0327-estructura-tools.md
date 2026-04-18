# T-0327 - Crear estructura de carpetas oficial de tools/prompts/skills

## Metadatos
- ID: `T-0327`
- Fase: `Fase 3`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `SystemArchitectAgent`

## Objetivo
Completar y documentar la estructura oficial de `tools/` (scripts de desarrollo) y verificar que `docs/08-codex/` (prompts, skills, agents) esta completo y organizado.

## Criterios de aceptación

### tools/ (scripts de desarrollo)
- [x] `tools/bootstrap.sh` — setup inicial del entorno (T-0317).
- [x] `tools/reset-local.sh` — reset completo local (T-0321).
- [x] `tools/generators/` — directorio para generadores de codigo.
- [x] `tools/generators/README.md` — documenta generadores planificados y su uso.

### docs/08-codex/ (sistema IA — Fase 1)
- [x] `docs/08-codex/agents/` — 11 agentes definidos.
- [x] `docs/08-codex/prompts/` — 9 prompts maestros.
- [x] `docs/08-codex/skills/` — 14 skills reutilizables.
- [x] `docs/08-codex/instructions/` — carpeta preparada.
- [x] `docs/08-codex/CODEX_MASTER_INSTRUCTIONS.md` — instrucciones globales.

## Estructura oficial

```
tools/
  bootstrap.sh          Setup inicial (pnpm install + .env + Docker check)
  reset-local.sh        Reset completo del entorno local
  generators/
    README.md           Indice y uso de generadores
    scaffold-module.sh  (por crear en Fase 6)
    scaffold-page.sh    (por crear en Fase 6)
    scaffold-adr.sh     (por crear en T-0336+)

docs/08-codex/
  CODEX_MASTER_INSTRUCTIONS.md
  agents/               11 agentes especializados
  prompts/              9 prompts maestros
  skills/               14 skills reutilizables
  instructions/         Instrucciones especificas por contexto
```

## Decisiones tecnicas
- **`tools/` para scripts ejecutables**: Contiene scripts bash — no documentacion ni prompts.
- **`docs/08-codex/` para sistema IA**: Prompts, skills y agents son documentacion, no scripts ejecutables.
- **Separacion clara**: Un agente sabe donde buscar herramientas (tools/) vs instrucciones (docs/08-codex/).
- **Generadores en Fase 6+**: Los generadores reales requieren que la estructura de modulos este definida.

## Pendientes no resueltos
- `scaffold-module.sh`, `scaffold-page.sh` y `scaffold-adr.sh` se crean en sus tasks correspondientes.
