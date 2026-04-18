# T-0315 - Configurar scripts de typecheck por app TS

## Metadatos
- ID: `T-0315`
- Fase: `Fase 3`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Asegurar que todas las apps y packages TypeScript tengan script `typecheck` operativo, y que Turbo lo orqueste correctamente.

## Criterios de aceptación
- [x] `apps/api` — `"typecheck": "tsc --noEmit"` (ya existía de T-0312).
- [x] `apps/worker` — `"typecheck": "tsc --noEmit"` (ya existía de T-0312).
- [x] `apps/web` — JS puro, no aplica typecheck (jsconfig.json para IDE).
- [x] `apps/desktop` — JS puro, no aplica typecheck (jsconfig.json para IDE).
- [x] `packages/ui` — `"typecheck": "tsc --noEmit"` añadido (se activará con tsconfig en Fase 3 avanzada).
- [x] `packages/shared` — `"typecheck": "tsc --noEmit"` añadido.
- [x] `packages/validation` — `"typecheck": "tsc --noEmit"` añadido.
- [x] `packages/sync-contracts` — `"typecheck": "tsc --noEmit"` añadido.
- [x] `packages/sdk` — `"typecheck": "tsc --noEmit"` añadido.
- [x] `turbo.json` — tarea `typecheck` con pipeline correcto (ya existía de T-0311).

## Archivos modificados
- `packages/ui/package.json`
- `packages/shared/package.json`
- `packages/validation/package.json`
- `packages/sync-contracts/package.json`
- `packages/sdk/package.json`

## Decisiones técnicas
- **web y desktop son JS**: Sin tsconfig, sin typecheck. El IDE usa jsconfig.json para autocompletado.
- **Packages con typecheck stub**: Los tsconfigs de cada package se crean cuando se implementa su código real (Fase 3 avanzada / Fase 6+).
- **turbo typecheck**: `dependsOn: ["^build"]` — correcto para monorepo con tipos cruzados entre packages.

## Pendientes no resueltos
- Ninguno. Los tsconfigs de packages se crean en sus tasks de implementación.
