# T-0416 - Crear Dockerfile del worker

## Metadatos
- ID: `T-0416`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Crear el Dockerfile multi-stage para el worker NestJS de AtlasERP, optimizado para produccion: imagen minima, usuario no-root, soporte Prisma, sin servidor HTTP.

## Criterios de aceptacion
- [x] `apps/worker/Dockerfile` creado con multi-stage build (builder + runner).
- [x] Node 20 Alpine como imagen base.
- [x] pnpm via corepack.
- [x] `--filter=@atlasrep/worker...` para dependencias del workspace.
- [x] Prisma client generado y copiado al runner.
- [x] Usuario no-root (`worker`) en la imagen de produccion.
- [x] Sin `EXPOSE` — el worker no tiene servidor HTTP.
- [x] Build desde la raiz del monorepo.

## Archivo creado
- `apps/worker/Dockerfile`

## Diferencias vs Dockerfile de API

| Aspecto              | API Dockerfile                 | Worker Dockerfile              |
| -------------------- | ------------------------------ | ------------------------------ |
| Usuario              | `nestjs` (UID 1001)            | `worker` (UID 1001)            |
| EXPOSE               | `3000`                         | Sin EXPOSE                     |
| curl                 | Si (para healthcheck Docker)   | No (sin healthcheck HTTP)      |
| PORT env             | Si (`ENV PORT=3000`)           | No                             |
| CMD                  | `node dist/main.js`            | `node dist/main.js`            |

## Estrategia de build

Identica a la API:
- Stage 1 (builder): instala todas las deps, compila TypeScript, genera Prisma.
- Stage 2 (runner): solo deps de produccion + dist + cliente Prisma.

## Contexto de build
```bash
docker build -f apps/worker/Dockerfile -t atlasrep/worker:${TAG} .
```
Desde la raiz del monorepo — igual que la API.

## Pendientes no resueltos
- `.dockerignore` raiz — se crea en T-0421.
- Implementacion de BullMQ queues — Fase 5.
- Multi-arch build — Fase 6.
