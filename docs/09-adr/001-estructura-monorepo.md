# ADR 001 â€” Estructura del monorepo

## Metadatos
- **ID**: `ADR-001`
- **Estado**: `aprobado`
- **Fecha**: `2026-04-12`
- **Task origen**: `T-0336`
- **Decisores**: SystemArchitectAgent, revision humana

## Contexto

AtlasERP es una plataforma con multiples apps (API backend, frontend web, desktop Tauri, worker de jobs) y multiples packages compartidos (UI, shared, validation, sync-contracts, SDK). Se necesita una estrategia de gestion de codigo que permita:
- Compartir codigo entre apps sin duplicacion.
- Desplegar apps de forma independiente.
- Mantener consistencia de tooling (lint, format, tests).
- Escalar el equipo sin conflictos de dependencias.

## Decision

**Monorepo con pnpm workspaces + Turbo como orquestador de builds.**

Estructura:
```
atlaserp/
  apps/
    api/       â€” NestJS backend
    web/       â€” React + Vite frontend
    desktop/   â€” Tauri desktop
    worker/    â€” NestJS worker BullMQ
  packages/
    ui/        â€” Componentes React compartidos
    shared/    â€” Constantes, enums, helpers
    validation/ â€” Esquemas Zod
    sync-contracts/ â€” Tipos de sync
    sdk/       â€” SDK cliente para la API
    config/    â€” ESLint, Prettier, tsconfig base
```

## Opciones consideradas

| Opcion           | Pros                               | Contras                                   |
| ---------------- | ---------------------------------- | ----------------------------------------- |
| Multirepo        | Deployments independientes         | Duplicacion de codigo, desync de versiones |
| Monorepo (elegido) | Codigo compartido, tooling unificado | Mayor complejidad inicial                |
| Nx               | Herramienta madura                 | Mayor curva de aprendizaje que Turbo      |

## Consecuencias

- **Positivas**: Un solo `pnpm install`, CI unificado, cambios transversales en un PR.
- **Negativas**: El repo crece con el tiempo â€” requiere disciplina en dependencias.
- **Restriccion**: Las apps no pueden tener dependencias circulares entre ellas.
- **Restriccion**: Los packages solo pueden depender de otros packages, nunca de apps.

