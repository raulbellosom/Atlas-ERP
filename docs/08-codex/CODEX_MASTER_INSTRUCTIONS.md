# CODEX MASTER INSTRUCTIONS

## ID de task origen

- `T-0111`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Gobernar el comportamiento de Codex dentro del repositorio AtlasERP. Este documento es la referencia maestra que cualquier agente o sesión de trabajo debe respetar.

## Stack tecnológico obligatorio

- Backend: NestJS + TypeScript + Prisma + PostgreSQL + Redis (colas/caché)
- Frontend web: React + Vite + JavaScript + TailwindCSS 4.1 + Lucide/Phosphor
- Desktop: Tauri + SQLite local (caché, cola de sync, snapshots)
- Archivos: MinIO / S3 compatible
- Infraestructura: Docker + Docker Compose (solo servicios de servidor)

## Reglas globales

1. No crear módulos sin revisar el canon (`docs/00-canon/*`).
2. No introducir entidades nuevas sin blueprint aprobado.
3. Toda entidad nueva debe declarar ownership (`docs/04-modules/00-politica-ownership-datos.md`).
4. Toda operación crítica debe auditarse.
5. Toda nueva entidad sincronizable debe declarar su política offline/sync.
6. PostgreSQL es la fuente central de verdad.
7. SQLite solo es auxiliar local del cliente desktop.
8. No usar Bootstrap.
9. Usar TailwindCSS 4.1.
10. Usar Lucide o Phosphor para iconografía.
11. Toda pantalla debe contemplar: loading, empty, error, offline, sync pending.
12. No asumir merges automáticos mágicos en datos sensibles.
13. Priorizar arquitectura modular monolítica.
14. Actualizar documentación cuando cambie el dominio o la arquitectura.
15. Usar español de México como idioma principal del proyecto.
16. Guardar archivos de texto en UTF-8.
17. Usar naming consistente según `docs/08-codex/00-naming-prompts-skills-agents.md`.
18. Respetar el backlog maestro (`business-platform-master-task-catalog.md`).
19. No crear código fuera de arquitectura modular.
20. Preferir cambios incrementales; evitar refactors masivos sin justificación.

## Instrucciones por capa

### Backend

- Usar NestJS modular con DTOs claros y services limpios.
- Mantener controladores delgados.
- Usar Prisma para acceso a datos (no SQL directo).
- Separar dominio, infraestructura y utilidades comunes.

### Frontend

- Usar React en JavaScript con carpetas por módulos.
- Reutilizar componentes base desde `packages/ui`.
- No mezclar lógica de sync compleja en componentes visuales.
- Priorizar UX profesional, consistente y limpia.

### Desktop

- Tauri actúa como shell y puente local.
- La lógica de negocio vive en backend y frontend compartido.
- SQLite local para cola, caché y snapshots controlados.
- Bridges nativos mínimos y claros.

### Sync

- Implementar cola local; validar en servidor.
- Registrar conflictos; permitir revisión humana.
- Auditar cada resolución.

## Instrucciones sobre tareas

1. Identificar el ID de la task.
2. Revisar dependencias previas.
3. Revisar canon y blueprints aplicables.
4. Implementar alcance exacto.
5. Agregar pruebas apropiadas.
6. Actualizar documentación relacionada.
7. Dejar notas para la siguiente task si aplica.

## Instrucciones sobre documentación

Cada cambio relevante debe actualizar alguno de: canon, blueprints, ADRs, task logs o changelog técnico.

## Instrucciones sobre calidad

- Preferir código explícito.
- Evitar complejidad accidental.
- No sobre-ingenierizar.
- Diseñar para crecimiento modular.
- No romper compatibilidad sin documentarlo.

## Agents disponibles

Ver `docs/08-codex/agents/` para roles detallados de cada agente.

## Prompts disponibles

Ver `docs/08-codex/prompts/` para prompts maestros por dominio.

## Skills disponibles

Ver `docs/08-codex/skills/` para capacidades reutilizables.

## Prioridad de implementación

1. Foundation (monorepo, infra, Prisma, backend, frontend, desktop)
2. Seguridad, auth, permisos y auditoría
3. Sync Core
4. Design System
5. Financial Operations Core
6. Reportes y operación
7. Calidad, testing, observabilidad
8. CI/CD, deploy, backups
9. Módulos futuros (Accounting Core, HR Core, etc.)

## Fuentes de verdad documentales

- `CODEX_START_HERE.md`
- `business-platform-master-task-catalog.md`
- `docs/00-canon/*`
- `docs/03-domain-blueprints/*`
- `docs/08-codex/*`
