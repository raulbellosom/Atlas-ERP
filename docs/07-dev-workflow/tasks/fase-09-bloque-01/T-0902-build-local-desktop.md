# T-0902 - Configurar build local desktop

## Metadatos
- ID: `T-0902`
- Fase: `Fase 9`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Establecer los comandos de build local para desktop, incluyendo build web embebido y comando de empaquetado Tauri.

## Implementación
- Se agregaron scripts operativos en `apps/desktop/package.json`:
  - `dev:web`
  - `build:web`
  - `preview`
  - `dev` (Tauri)
  - `build` (Tauri)
- Se instaló `@tauri-apps/cli` como dependencia de desarrollo para ejecutar `tauri` desde scripts de workspace.
- Se dejó configurado el pipeline frontend -> Tauri en `tauri.conf.json`.

## Validaciones ejecutadas
- `pnpm.cmd --filter @atlasrep/desktop run lint` ✅
- `pnpm.cmd --filter @atlasrep/desktop run build:web` ✅
- `pnpm.cmd --filter @atlasrep/desktop run build` ❌ (bloqueado por prerequisito local: `cargo` no instalado en el entorno actual)

## Criterios de aceptación
- [x] Existe comando de build web local para desktop.
- [x] Existe comando de empaquetado Tauri.
- [x] Se documentó prerequisito faltante para build nativo.

## Evidencia
- `apps/desktop/package.json`
- `apps/desktop/src-tauri/tauri.conf.json`

