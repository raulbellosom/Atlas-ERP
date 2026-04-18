# T-0326 - Crear estructura de carpetas oficial de docs

## Metadatos
- ID: `T-0326`
- Fase: `Fase 3`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DocumentationAgent`

## Objetivo
Verificar y completar la estructura oficial de `docs/`, creando la carpeta `docs/09-adr/` para los Architecture Decision Records y asegurando que todos los directorios tienen su README.

## Criterios de aceptación
- [x] `docs/00-canon/` — canon del proyecto (existia, completo).
- [x] `docs/01-product/` — vision de producto (existia).
- [x] `docs/02-architecture/` — decisiones y estrategias tecnicas (existia, 18 docs).
- [x] `docs/03-domain-blueprints/` — blueprints de dominio (existia).
- [x] `docs/04-modules/` — politica de ownership de datos (existia).
- [x] `docs/05-sync/` — politica offline y sync (existia).
- [x] `docs/06-security/` — seguridad (existia).
- [x] `docs/07-dev-workflow/` — workflow operativo (existia, completo).
- [x] `docs/08-codex/` — sistema de trabajo IA (existia, completo desde Fase 1).
- [x] `docs/09-adr/` — **CREADO** — Architecture Decision Records.
- [x] `docs/09-adr/README.md` — explica formato ADR, estados y tabla de ADRs activos.
- [x] `docs/09-roadmap/` — roadmap del proyecto (existia con README).

## Estructura oficial de docs

```
docs/
  00-canon/              Canon inmutable del proyecto
  01-product/            Vision y definicion de producto
  02-architecture/       Decisiones arquitectonicas y estrategias tecnicas
  03-domain-blueprints/  Blueprints de dominio (entidades, relaciones)
  04-modules/            Politica de ownership de datos por modulo
  05-sync/               Politica offline/sync
  06-security/           Seguridad y autenticacion
  07-dev-workflow/       Workflow operativo, tasks, bloques
  08-codex/              Sistema de trabajo con IA (agents, skills, prompts)
  09-adr/                Architecture Decision Records (T-0336+)
  09-roadmap/            Roadmap de fases y estimados
```

## Archivos creados
- `docs/09-adr/README.md`

## Decisiones tecnicas
- **`09-adr/` como directorio dedicado**: Los ADRs son documentos de decision inmutables una vez aprobados. Merecen su propio directorio separado de `02-architecture/` (que contiene estrategias y politicas).
- **Numeracion `09`**: Despues de `09-roadmap` — los ADRs son documentos vivos que se agregan conforme el proyecto crece.
- **README con tabla de ADRs activos**: La tabla en el README funciona como indice de todos los ADRs, actualizable al crear cada uno.

## Pendientes no resueltos
- Los ADRs 001-004 se crean en T-0336 a T-0339.
