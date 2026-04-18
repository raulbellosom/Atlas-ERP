# ADR 002 — Stack tecnológico oficial

## Metadatos
- **ID**: `ADR-002`
- **Estado**: `aprobado`
- **Fecha**: `2026-04-12`
- **Task origen**: `T-0337`
- **Decisores**: SystemArchitectAgent, revision humana

## Contexto

AtlasERP requiere un stack que soporte: API REST robusta, frontend SPA profesional, cliente desktop offline-capable, procesamiento asíncrono de jobs, almacenamiento de archivos y sincronizacion bidireccional local/servidor.

## Decision

**Stack oficial AtlasERP:**

| Capa           | Tecnologia                             | Justificacion                                         |
| -------------- | -------------------------------------- | ----------------------------------------------------- |
| Backend API    | NestJS + TypeScript + Prisma           | DI nativo, modular, ecosistema maduro                 |
| Base de datos  | PostgreSQL 16                          | Fuente central de verdad, ACID, JSON nativo           |
| Colas/cache    | Redis 7 + BullMQ                       | Colas confiables, reintentos, dead letter queue       |
| Frontend web   | React + Vite + JavaScript + TailwindCSS 4.1 | Productividad alta, ecosistema amplio          |
| Desktop        | Tauri 2 + SQLite (rusqlite bundled)    | Binario nativo ligero, SQLite para offline            |
| Almacenamiento | MinIO / S3-compatible                  | Archivos adjuntos, self-hosted o cloud                |
| Iconografia    | Lucide / Phosphor Icons                | Consistencia visual, tree-shakeable                   |
| Package manager | pnpm 9                                | Workspaces nativos, disco eficiente                   |
| Build orchestrator | Turbo 2                           | Cache inteligente de builds en monorepo               |

## Restricciones de canon

- No usar Bootstrap (prohibido en CODEX_MASTER_INSTRUCTIONS).
- Solo TailwindCSS 4.1 para estilos.
- Solo Lucide o Phosphor para iconos.
- `apps/web` usa JavaScript (no TypeScript) — decision de productividad.
- `apps/api` y `apps/worker` usan TypeScript estricto.

## Consecuencias

- **Positivas**: Stack probado en produccion, buena documentacion, contratacion viable.
- **Negativas**: Tauri requiere Rust — curva de aprendizaje para bridges nativos.
- **Restriccion**: Cambios de stack de Nivel 2+ requieren nuevo ADR y revision.
