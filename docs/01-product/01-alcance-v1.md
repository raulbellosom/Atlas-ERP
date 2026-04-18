# Alcance de Plataforma v1

## Alcance incluido
- Base de plataforma modular monolítica en monorepo.
- Superficies de producto: web, desktop y backend central.
- Offline parcial controlado con sincronización y resolución explícita de conflictos.
- Módulos núcleo de plataforma previos al negocio:
  - Auth
  - Users
  - Roles & Permissions
  - Organizations
  - Audit
  - Attachments
  - Settings
  - Feature Flags
  - Sync Core
- Primer macro-módulo de negocio:
  - Financial Operations Core / Tesorería y Movimientos

## Alcance técnico mínimo
- Backend con NestJS + TypeScript + Prisma + PostgreSQL.
- Frontend web con React + Vite + JavaScript + TailwindCSS 4.1.
- Desktop con Tauri y SQLite local para cola/caché/snapshots de sync.
- Infraestructura base con Docker para servicios de servidor.

