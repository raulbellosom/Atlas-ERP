# T-0316 - Configurar scripts de clean

## Metadatos
- ID: `T-0316`
- Fase: `Fase 3`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Asegurar que todas las apps y packages tienen script `clean` operativo, con un `clean:all` a nivel raíz para reset completo incluyendo node_modules.

## Criterios de aceptación
- [x] `apps/api` — `"clean": "rm -rf dist"` (existía).
- [x] `apps/web` — `"clean": "rm -rf dist"` (existía).
- [x] `apps/worker` — `"clean": "rm -rf dist"` (existía).
- [x] `apps/desktop` — `"clean": "rm -rf dist src-tauri/target"` (existía; incluye Rust).
- [x] `packages/*` — `"clean": "rm -rf dist"` (ya existían en todos los packages).
- [x] Raíz — `"clean": "turbo clean"` (existía de T-0311).
- [x] Raíz — `"clean:all"` añadido: ejecuta turbo clean + elimina todos los node_modules.

## Archivos modificados
- `package.json` (raíz) — script `clean:all` añadido

## Decisiones técnicas
- **`clean:all` usa `find -prune`**: Más seguro que `rm -rf **/node_modules` con globs que pueden fallar en shells no-bash.
- **`clean` (turbo) vs `clean:all`**: `clean` solo borra `dist/`. `clean:all` es para resolver problemas de dependencias corruptas — se ejecuta manualmente.
- **desktop incluye `src-tauri/target`**: El directorio de build de Rust puede pesar varios GB — importante incluirlo en clean.

## Pendientes no resueltos
- Ninguno.
