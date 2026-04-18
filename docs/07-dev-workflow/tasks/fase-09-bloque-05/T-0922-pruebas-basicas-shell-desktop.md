# T-0922 - Configurar pruebas básicas de shell desktop

## Metadatos
- ID: `T-0922`
- Fase: `Fase 9`
- Bloque: `Bloque 5`
- Estado: `CERRADA`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Definir una prueba smoke automatizada para validar presencia de contratos críticos del shell desktop en cada cambio.

## Implementación
- Script agregado:
  - `apps/desktop/scripts/shell-smoke-check.mjs`
- Script valida:
  - comandos críticos en `commands.rs`
  - registro de comandos en `lib.rs`
  - presencia de bootstrap/panel en frontend
- Comando de package agregado:
  - `pnpm --filter @atlasrep/desktop run test:shell-smoke`

## Validaciones ejecutadas
- `pnpm.cmd --filter @atlasrep/desktop run lint` -> OK
- `pnpm.cmd --filter @atlasrep/desktop run build:web` -> OK
- `pnpm.cmd --filter @atlasrep/desktop run test:shell-smoke` -> OK
- `pnpm.cmd --filter @atlasrep/desktop run build` -> bloqueado por falta de `cargo`

## Criterios de aceptación
- [x] Existe prueba smoke del shell desktop.
- [x] Prueba ejecutable desde script de package.
- [x] Validación ejecutada en esta sesión con resultado OK.

## Pendientes
- La ejecución de `tauri build` queda condicionada al prerrequisito abierto en `T-0902` (instalación de toolchain Rust en entorno local).

## Evidencia
- `apps/desktop/scripts/shell-smoke-check.mjs`
- `apps/desktop/package.json`
