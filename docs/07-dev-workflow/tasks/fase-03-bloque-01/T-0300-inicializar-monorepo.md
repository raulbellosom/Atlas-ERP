# T-0300 - Inicializar monorepo

## Metadatos
- ID: `T-0300`
- Fase: `Fase 3`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Crear la estructura de directorios oficial del monorepo AtlasERP: apps/, packages/, prisma/, infra/, tools/, .github/.

## Criterios de aceptación
- [x] Directorio `apps/` creado con subdirectorios: api, web, desktop, worker.
- [x] Directorio `packages/` creado con subdirectorios: ui, shared, validation, sync-contracts, sdk, config.
- [x] Directorio `prisma/` creado con migrations/ y seeds/.
- [x] Directorio `infra/` creado con docker/, nginx/, scripts/, backup/.
- [x] Directorio `tools/` creado.
- [x] Directorio `.github/workflows/` creado.
- [x] `.gitignore` creado con exclusiones correctas (node_modules, .env, dist, SQLite, etc.).

## Archivos creados
- `apps/` — directorios vacíos con package.json stub
- `packages/` — directorios vacíos con package.json stub
- `prisma/migrations/`, `prisma/seeds/`
- `infra/docker/`, `infra/nginx/`, `infra/scripts/`, `infra/backup/`
- `.gitignore`

## Pendientes no resueltos
- Ninguno.
