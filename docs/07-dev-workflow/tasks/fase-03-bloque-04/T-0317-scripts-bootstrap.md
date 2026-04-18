# T-0317 - Configurar scripts de bootstrap inicial

## Metadatos
- ID: `T-0317`
- Fase: `Fase 3`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Crear un script de bootstrap que prepare el entorno de desarrollo desde cero en una sola ejecución: verificar herramientas, instalar dependencias y copiar archivos .env.

## Criterios de aceptación
- [x] `tools/bootstrap.sh` creado con verificaciones de Node.js >= 20 y pnpm >= 9.
- [x] El script instala dependencias con `pnpm install`.
- [x] El script copia `apps/api/.env.example` → `apps/api/.env` si no existe.
- [x] El script verifica Docker e informa sobre pasos siguientes.
- [x] Script `"bootstrap": "bash tools/bootstrap.sh"` añadido a `package.json` raíz.
- [x] Salida con colores e instrucciones claras de pasos siguientes.

## Archivos creados/modificados
- `tools/bootstrap.sh`
- `package.json` (raíz) — script `bootstrap`

## Flujo del script
1. Verificar Node.js >= 20 → error si falla
2. Verificar pnpm >= 9 → error si falta
3. `pnpm install` — instala todas las dependencias del monorepo
4. Copiar `.env.example` → `.env` (solo si `.env` no existe)
5. Verificar Docker (warning si no está instalado)
6. Mostrar pasos siguientes: editar .env → infra:up → db:migrate → dev

## Decisiones técnicas
- **`set -euo pipefail`**: El script falla en cualquier comando que falle — no ejecuta pasos siguientes con estado roto.
- **No sobreescribe .env existente**: Protege configuración local del desarrollador.
- **Script en `tools/`**: Centraliza scripts de gestión del monorepo. No en raíz para no contaminar el root.

## Pendientes no resueltos
- Ninguno.
