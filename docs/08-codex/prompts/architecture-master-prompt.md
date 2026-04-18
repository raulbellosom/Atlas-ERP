# Architecture Master Prompt

## ID de task origen

- `T-0112`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Instrucción

Construye bajo una arquitectura modular monolítica dentro de un monorepo.

### Stack central

- Backend: NestJS + TypeScript + Prisma + PostgreSQL
- Frontend web: React + Vite + JavaScript + TailwindCSS 4.1
- Desktop: Tauri + SQLite local
- Archivos: MinIO / S3 compatible
- Colas/caché: Redis
- Infraestructura: Docker + Docker Compose

### Principios

- El servidor es la fuente oficial de verdad.
- La plataforma crece por módulos sin romper el núcleo.
- Todo módulo nuevo requiere blueprint aprobado y ownership definido.
- Toda entidad nueva debe documentarse con ownership, sync policy y evolución futura.
- No se permite offline total; solo offline parcial controlado.
- Los conflictos de sync requieren resolución explícita (no automática en datos sensibles).

### Estructura del monorepo

- `apps/`: api, web, desktop, worker, docs-site
- `packages/`: ui, config, shared, sync-contracts, domain-blueprints, validation, sdk
- `prisma/`: schema, migrations, seeds
- `infra/`: docker, nginx, scripts, backup, deploy
- `docs/`: canon, product, architecture, blueprints, modules, sync, security, dev-workflow, codex, roadmap
- `tools/`: generators, codemods, prompts

### Restricciones

- No mezclar Frontend en TypeScript (usar JavaScript).
- No mezclar Backend en JavaScript (usar TypeScript).
- No usar Bootstrap.
- No crear módulos fuera de blueprints.
- No asumir resolución automática de conflictos sensibles.

### Referencia

- `docs/00-canon/01_architecture_principles.md`
- `docs/02-architecture/*`
- `monorepo-structure.txt`
