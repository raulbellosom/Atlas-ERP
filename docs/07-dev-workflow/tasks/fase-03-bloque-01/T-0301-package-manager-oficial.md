# T-0301 - Definir package manager oficial

## Metadatos
- ID: `T-0301`
- Fase: `Fase 3`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Elegir y registrar el package manager oficial del monorepo AtlasERP.

## Decisión
**Package manager oficial: pnpm v9**

### Justificación
- Soporte nativo de workspaces para monorepos.
- Significativamente más eficiente en disco que npm (hard links compartidos).
- Mejor compatibilidad con Turbo (herramienta de build orchestration del monorepo).
- Instala más rápido que npm y yarn en monorepos grandes.
- `pnpm-workspace.yaml` es simple y explícito.

### Alternativas descartadas
- `npm workspaces`: más lento, mayor uso de disco.
- `yarn berry`: mayor complejidad de configuración (PnP mode).
- `bun`: buen rendimiento pero menor madurez en workspaces de TypeScript a gran escala.

## Criterios de aceptación
- [x] `package.json` raíz incluye `"packageManager": "pnpm@9.15.0"`.
- [x] `engines.pnpm >= 9.0.0` declarado en package.json raíz.
- [x] `.npmrc` creado con configuración base.
- [x] Decisión documentada en este task file.

## Archivos creados/modificados
- `package.json` (raíz) — campo `packageManager`
- `.npmrc`

## Pendientes no resueltos
- Ninguno.
