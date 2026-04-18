# T-0304 - Crear packages base: ui, shared, validation, sync-contracts, sdk

## Metadatos
- ID: `T-0304`
- Fase: `Fase 3`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Crear los paquetes compartidos del monorepo como directorios con package.json stub, listos para recibir código en tasks posteriores.

## Criterios de aceptación
- [x] `packages/ui/package.json` — `@atlasrep/ui` (componentes React + Tailwind).
- [x] `packages/shared/package.json` — `@atlasrep/shared` (constantes, enums, helpers).
- [x] `packages/validation/package.json` — `@atlasrep/validation` (esquemas Zod).
- [x] `packages/sync-contracts/package.json` — `@atlasrep/sync-contracts` (tipos de sync).
- [x] `packages/sdk/package.json` — `@atlasrep/sdk` (SDK cliente para la API).
- [x] `packages/config/package.json` — `@atlasrep/config` (eslint, prettier, tsconfig base).
- [x] Naming scope consistente: `@atlasrep/<nombre>`.

## Archivos creados
- `packages/ui/package.json`
- `packages/shared/package.json`
- `packages/validation/package.json`
- `packages/sync-contracts/package.json`
- `packages/sdk/package.json`
- `packages/config/package.json`

## Nota de implementación
Los package.json son stubs. El contenido real de cada paquete se implementa en tasks de Fase 3 específicas (T-0304+).

## Pendientes no resueltos
- Ninguno.
