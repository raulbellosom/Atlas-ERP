# T-0303 - Crear apps base: api, web, desktop, worker

## Metadatos
- ID: `T-0303`
- Fase: `Fase 3`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Crear las 4 aplicaciones base del monorepo como directorios con package.json stub, listos para ser inicializados con su stack en las tasks siguientes.

## Criterios de aceptación
- [x] `apps/api/package.json` creado con nombre `@atlasrep/api` y scripts placeholder.
- [x] `apps/web/package.json` creado con nombre `@atlasrep/web` y scripts placeholder.
- [x] `apps/desktop/package.json` creado con nombre `@atlasrep/desktop` y scripts placeholder.
- [x] `apps/worker/package.json` creado con nombre `@atlasrep/worker` y scripts placeholder.
- [x] Naming scope consistente: `@atlasrep/<nombre>`.

## Archivos creados
- `apps/api/package.json`
- `apps/web/package.json`
- `apps/desktop/package.json`
- `apps/worker/package.json`

## Nota de implementación
Los package.json son stubs con scripts placeholder (`echo 'TODO: ...'`). El stack real (NestJS, Vite, Tauri, etc.) se instala en tareas de la Fase 3 específicas de cada app (T-0323 en adelante).

## Pendientes no resueltos
- Ninguno.
