# Estado de Ejecución - Fase 3 / Bloque 8

## Contexto
- Fecha de cierre de bloque: **2026-04-12**
- Fase 3: Monorepo, paquetes base y tooling
- Bloque 8: Gestor de versiones y ADRs iniciales 001-004

## Estado del bloque
- Bloque `T-0335` a `T-0339`: **CERRADO**

## Estado por task

| ID     | Título                                           | Estado  | Evidencia                                                                                       |
| ------ | ------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------- |
| T-0335 | Configurar gestor de cambios de versiones internas | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-08/T-0335-gestor-versiones.md`                     |
| T-0336 | Crear ADR inicial de estructura de monorepo      | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-08/T-0336-adr-monorepo.md`                          |
| T-0337 | Crear ADR inicial de stack                       | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-08/T-0337-adr-stack.md`                             |
| T-0338 | Crear ADR inicial de modular monolith            | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-08/T-0338-adr-modular-monolith.md`                  |
| T-0339 | Crear ADR inicial de sync architecture           | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-08/T-0339-adr-sync.md`                              |

## Archivos creados en este bloque

### ADRs formales (docs/09-adr/)
- `001-estructura-monorepo.md` — Decision: pnpm workspaces + Turbo; restricciones de dependencias
- `002-stack-tecnologico.md` — Stack completo: NestJS, React/Vite/JS, Tauri, PostgreSQL, Redis, MinIO
- `003-modular-monolith.md` — Un proceso NestJS con modulos por dominio; sin imports cross-module
- `004-arquitectura-sync.md` — Cola SQLite local + sync push/pull; no merge automatico en datos criticos

## Siguiente bloque
**Fase 3 / Bloque 9** (`T-0340`): Aprobar baseline del monorepo — cierre formal de Fase 3.
Nota: T-0340 es la unica task de este bloque (Fase 3 tiene 41 tasks: T-0300 a T-0340).
