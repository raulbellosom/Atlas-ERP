# T-0800 - Inicializar app React + Vite en JavaScript

## Metadatos
- ID: `T-0800`
- Fase: `Fase 8`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Objetivo
Inicializar la aplicación React + Vite en JavaScript con todas las dependencias necesarias para el frontend de AtlasERP.

## Alcance
- Actualizar `apps/web/package.json` con dependencias:
  - Producción: react@19, react-dom, react-router-dom@7, @tanstack/react-query@5, zustand@5, axios, react-hook-form, zod.
  - Dev: @tailwindcss/vite, @vitejs/plugin-react, vite@6, vitest, eslint plugins.
- Crear `apps/web/index.html` (entry point de Vite).
- Actualizar `apps/web/src/main.jsx`: usar `StrictMode` sin `import React` (nuevo JSX transform).
- Ejecutar `pnpm install` para resolver dependencias.

## Resultados
- 154 módulos transformados en build de producción.
- `vite build` OK en 1.82s.
- Dev server responde 200 en localhost:5173.

## Criterios de aceptacion
- [x] `pnpm install` sin errores.
- [x] `vite build` OK.
- [x] Dev server arranca y responde.
- [x] lint OK.

## Fuera de alcance
- Configuración de CI/CD para el frontend.
- Tests end-to-end con Playwright.

## Dependencias
- Fase 7 completada (backend con JWT y CORS disponible).
