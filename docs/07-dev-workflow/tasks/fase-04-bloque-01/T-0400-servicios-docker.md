# T-0400 - Definir servicios que correrán en Docker

## Metadatos
- ID: `T-0400`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Documentar y aprobar cuales servicios del sistema AtlasERP se ejecutan en Docker y en que ambientes.

## Criterios de aceptación
- [x] `docs/02-architecture/19-servicios-docker.md` creado con decision aprobada.
- [x] Servicios de infraestructura (postgres, redis, minio) — Docker en todos los ambientes.
- [x] Servicios de app (api, worker, web, nginx) — Docker solo en staging y prod.
- [x] Desktop (Tauri) — nunca en Docker.
- [x] Tabla por ambiente (dev / staging / prod) con compose file correspondiente.
- [x] Justificacion documentada: codigo en host en dev para hot-reload eficiente.

## Archivos creados
- `docs/02-architecture/19-servicios-docker.md`

## Decision clave

En desarrollo, Docker solo corre los 3 servicios de infraestructura (postgres, redis, minio). Los servidores NestJS y Vite se ejecutan en el host para tener hot-reload sin la latencia de reconstruir contenedores.

En staging/prod, todo el codigo de servidor se contiene (api, worker, web/nginx). El desktop Tauri nunca se dockeriza — es un binario nativo que el usuario instala.

## Pendientes no resueltos
- Ninguno.
