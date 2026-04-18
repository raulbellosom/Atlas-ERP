# T-0302 - Configurar workspaces del monorepo

## Metadatos
- ID: `T-0302`
- Fase: `Fase 3`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Configurar los workspaces de pnpm para que el monorepo reconozca apps/ y packages/ como paquetes gestionados.

## Criterios de aceptación
- [x] `pnpm-workspace.yaml` creado con entradas para `apps/*` y `packages/*`.
- [x] `package.json` raíz tiene `"private": true` (requerido para workspaces).
- [x] Scripts raíz del monorepo definidos (dev, build, test, lint, clean, db:*, infra:*).
- [x] Turbo añadido como devDependency raíz (orchestrador de scripts del monorepo).

## Archivos creados/modificados
- `pnpm-workspace.yaml`
- `package.json` (raíz)

## Nota de implementación
El archivo `turbo.json` de configuración de Turbo se crea en T-0311 (scripts raíz del monorepo). Esta task cubre solo la configuración base de workspaces.

## Pendientes no resueltos
- Ninguno.
