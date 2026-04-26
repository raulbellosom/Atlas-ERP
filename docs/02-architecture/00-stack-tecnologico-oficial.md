# Stack Tecnológico Oficial

## Objetivo
Declarar la decisión oficial de stack para AtlasERP v1.

## Decisión oficial
- Arquitectura: monorepo + modular monolith.
- Backend: NestJS + TypeScript + Prisma + PostgreSQL.
- Frontend web: React + Vite + JavaScript + TailwindCSS 4.1.
- Desktop: Tauri + SQLite local para cola, caché y snapshots de sync.
- Cache/colas servidor: Redis cuando aplique.
- Archivos: MinIO o S3 compatible.
- Infraestructura de servicios: Docker + Docker Compose por entorno.
- UI iconografía: Lucide o Phosphor.
- Restricción explícita: no usar Bootstrap.

## Criterios de cambio de stack
- Solo por decisión de governance documentada.
- Debe incluir impacto en arquitectura, costos, migración y compatibilidad.
- Debe actualizar canon, backlog y documentos operativos relacionados.

