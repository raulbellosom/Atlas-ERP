# Índice General de Blueprints

## Propósito
Punto de entrada para encontrar cualquier blueprint del proyecto. Organizado por tipo y estado.

---

## Blueprints de dominio — Módulos activos

| Blueprint | Archivo | Estado |
|-----------|---------|--------|
| Core Platform | `core-platform.md` | Aprobado |
| Sync Core | `sync-core.md` | Aprobado |
| Financial Operations Core | `financial-operations-core.md` | Aprobado |

## Blueprints de dominio — Módulos futuros

| Blueprint | Archivo | Estado |
|-----------|---------|--------|
| Accounting Core | `accounting-core-future.md` | Futuro — no iniciar sin blueprint técnico |
| HR Core | `hr-core-future.md` | Futuro — no iniciar sin blueprint técnico |
| Purchases Core | `purchases-core-future.md` | Futuro — no iniciar sin blueprint técnico |
| Inventory Core | `inventory-core-future.md` | Futuro — no iniciar sin blueprint técnico |
| CRM Core | `crm-core-future.md` | Futuro — no iniciar sin blueprint técnico |
| Notifications Core | `notifications-core-future.md` | Futuro — no iniciar sin blueprint técnico |

---

## Blueprints técnicos — Aplicaciones

| Blueprint | Archivo | Estado |
|-----------|---------|--------|
| Web App (apps/web) | `blueprint-tecnico-web-app.md` | Aprobado |
| Desktop App (apps/desktop) | `blueprint-tecnico-desktop-app.md` | Aprobado |
| Backend API (apps/api) | `blueprint-tecnico-backend-api.md` | Aprobado |
| Worker/Jobs (apps/worker) | `blueprint-tecnico-worker.md` | Aprobado |

## Blueprints técnicos — Infraestructura y servicios transversales

| Blueprint | Archivo | Estado |
|-----------|---------|--------|
| Infraestructura Docker | `blueprint-tecnico-docker-infra.md` | Aprobado |
| SQLite local (desktop) | `blueprint-tecnico-sqlite-local.md` | Aprobado |
| Sync Center | `blueprint-tecnico-sync-center.md` | Aprobado |
| Auditoría | `blueprint-tecnico-auditoria.md` | Aprobado |
| Feature Flags | `blueprint-tecnico-feature-flags.md` | Aprobado |
| Archivos y Adjuntos | `blueprint-tecnico-adjuntos.md` | Aprobado |
| Observabilidad | `blueprint-tecnico-observabilidad.md` | Aprobado |
| Backups y Restore | `blueprint-tecnico-backups-restore.md` | Aprobado |

---

## Mapas del dominio

| Documento | Archivo | Estado |
|-----------|---------|--------|
| Entidades centrales compartidas | `mapa-entidades-centrales.md` | Aprobado |
| Relaciones entre módulos | `mapa-relaciones-modulos.md` | Aprobado |

---

## Regla de uso

Todo módulo nuevo debe:
1. Tener un blueprint de dominio aprobado antes de iniciar implementación.
2. Tener un blueprint técnico aprobado antes de escribir código.
3. Estar registrado en este índice.
4. No puede iniciar sin que sus dependencias estén operativas (ver mapa de relaciones).
