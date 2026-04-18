# T-0415 - Crear Dockerfile del backend

## Metadatos
- ID: `T-0415`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Crear el Dockerfile multi-stage para el backend NestJS de AtlasERP, optimizado para produccion: imagen minima, sin codigo fuente, con usuario no-root y soporte para Prisma en monorepo.

## Criterios de aceptacion
- [x] `apps/api/Dockerfile` creado con multi-stage build (builder + runner).
- [x] Node 20 Alpine como imagen base.
- [x] pnpm via corepack para consistencia con el monorepo.
- [x] `--frozen-lockfile` en todas las instalaciones.
- [x] `--filter=@atlasrep/api...` para instalar solo las dependencias necesarias.
- [x] Prisma client generado en el builder y copiado al runner.
- [x] Usuario no-root (`nestjs`) en la imagen de produccion.
- [x] `curl` instalado para el healthcheck de Docker.
- [x] Build desde la raiz del monorepo (contexto de build = raiz del repo).

## Archivo creado
- `apps/api/Dockerfile`

## Estrategia de build

### Contexto de build
El Dockerfile se construye desde la RAIZ del monorepo (no desde `apps/api/`):
```bash
# Desde la raiz del repo:
docker build -f apps/api/Dockerfile -t atlasrep/api:${TAG} .
```
Esto es necesario porque:
1. `pnpm-workspace.yaml` esta en la raiz.
2. `pnpm-lock.yaml` es compartido por todo el monorepo.
3. `packages/config/` es una dependencia compartida.

### Stage 1: builder
```dockerfile
FROM node:20-alpine AS builder
```
- Instala todas las dependencias (incluyendo devDependencies) via `--filter=@atlasrep/api...`.
- El operador `...` incluye todas las dependencias del workspace que necesita `@atlasrep/api`.
- Ejecuta `nest build` → produce `dist/` con el JS compilado.
- Genera el cliente Prisma para la arquitectura del contenedor (no la del host de CI).

### Stage 2: runner
```dockerfile
FROM node:20-alpine AS runner
```
- Instala solo dependencias de produccion (`--prod`).
- Copia `dist/` del builder.
- Copia el cliente Prisma generado (`node_modules/.prisma`).
- Copia `prisma/` para que `prisma migrate deploy` funcione si se ejecuta desde el contenedor.
- No contiene TypeScript, ESLint, ni el codigo fuente original.

## Optimizacion de capas

El orden de `COPY` esta optimizado para aprovechar el cache de Docker:
1. Manifiestos (`package.json`, `pnpm-lock.yaml`) — cambian poco.
2. `pnpm install` — usa cache si los manifiestos no cambiaron.
3. Codigo fuente — copia al final, invalida cache solo cuando hay cambios de codigo.

## Seguridad

- Usuario no-root `nestjs` (UID 1001) — el proceso Node.js no corre como root.
- Imagen Alpine — superficie de ataque minima.
- Sin devDependencies en la imagen final — sin herramientas de build expuestas.
- Sin codigo fuente TypeScript en la imagen final — solo JS compilado.

## .dockerignore requerido

El proyecto debe tener `.dockerignore` en la raiz para excluir:
```
node_modules
.git
dist
*.md
.env*
```
Se crea en T-0420+.

## Pendientes no resueltos
- `.dockerignore` raiz — se crea en T-0421.
- Migraciones automaticas al arrancar (`prisma migrate deploy`) — decision de Fase 5.
- Multi-arch build (linux/amd64 + linux/arm64) para deployment en ARM — Fase 6.
