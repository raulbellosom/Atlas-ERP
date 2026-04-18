# T-0900 - Inicializar Tauri en `apps/desktop`

## Metadatos
- ID: `T-0900`
- Fase: `Fase 9`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Formalizar la base de la app desktop en `apps/desktop` con estructura Tauri + React, dejando listo el punto de partida para bridges nativos y operación offline-first.

## Implementación
- Se consolidó el package de workspace `@atlasrep/desktop` con scripts y dependencias de desktop foundation.
- Se mantuvo el shell Rust en `src-tauri` con entrypoint limpio para extensiones posteriores.
- Se dejó la estructura de carpetas de frontend alineada al patrón del monorepo.

## Criterios de aceptación
- [x] `apps/desktop` existe como app del workspace.
- [x] `src-tauri/` está inicializado y funcional como shell base.
- [x] El package desktop incluye scripts operativos de desarrollo y build.

## Evidencia
- `apps/desktop/package.json`
- `apps/desktop/src-tauri/Cargo.toml`
- `apps/desktop/src-tauri/src/main.rs`
- `apps/desktop/src-tauri/src/lib.rs`

