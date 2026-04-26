# ROOT PROJECT CONTEXT

## Contexto general

Este repositorio construye una plataforma de negocio modular preparada para crecer con el tiempo.  
No es una app aislada ni una demo temporal: es la base de una familia de módulos empresariales que deben convivir correctamente.


## Nombre del producto (temporal)

- Nombre interno de código: **AtlasERP**
- Nombre visible temporal: **Atlas ERP**
- El nombre comercial final puede cambiar después.

## Idioma y codificación

- Idioma principal del proyecto: **español de México**.
- Codificación de texto obligatoria: **UTF-8**.

## Objetivo inicial

Entregar primero un núcleo funcional de operación financiera llamado:

- **Financial Operations Core**
- visible en español como **Tesorería y Movimientos**

## Visión posterior

Sobre esta base, la plataforma crecerá a módulos como:
- Accounting Core
- HR Core
- Purchases Core
- Inventory Core
- CRM Core

## Superficies del producto

### Web
- React + Vite + JavaScript
- PWA cuando aplique
- offline parcial controlado

### Desktop
- Tauri
- SQLite local
- bridges nativos para capacidades locales

### Backend
- NestJS + Prisma + PostgreSQL
- servidor como source of truth

## Offline y sincronización

La plataforma debe permitir trabajo offline parcial y posterior sincronización.  
Cuando existan diferencias entre cambios locales y cambios del servidor, debe existir una zona específica para revisar, aprobar, fusionar o descartar.

Ese centro se llama:

- **Sync Center**

## Filosofía de crecimiento

Cada módulo futuro debe construirse con:
- blueprint
- ownership
- política de sincronización
- permisos
- auditoría
- backend
- frontend
- pruebas
- documentación

## Referencias clave
- `CODEX_START_HERE.md`
- `CODEX_MASTER_PROMPT.md`
- `business-platform-master-task-catalog.md`
- `docs/01-product/README.md`
- `docs/02-architecture/README.md`
- `docs/03-domain-blueprints/README.md`
- `docs/04-modules/README.md`
- `docs/05-sync/README.md`
- `docs/06-security/README.md`
- `docs/08-codex/README.md`
- `docs/09-roadmap/README.md`
- `docs/07-dev-workflow/README.md`


