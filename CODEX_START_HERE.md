# CODEX START HERE

Este archivo es el punto de entrada principal para Codex dentro del repositorio.


## Nombre del proyecto (temporal)

- Nombre interno de código: **AtlasERP**
- Nombre visible temporal: **Atlas ERP**
- El nombre comercial final puede cambiar después sin afectar la arquitectura base.

## Idioma y codificación obligatorios

- Idioma principal de documentación y comunicación del proyecto: **español de México**.
- Codificación obligatoria para archivos de texto (`.md`, `.txt`, `.json`, `.yml`, `.yaml`, `.ts`, `.js`, etc.): **UTF-8**.
- Si aparece texto corrupto por mala codificación, debe corregirse antes de continuar.


## Qué es este proyecto

Este repositorio construirá una plataforma modular de negocio, pensada para crecer por módulos sin rehacer la arquitectura base.  
El sistema debe comenzar con un primer macro-módulo funcional llamado:

- **Financial Operations Core**
- Nombre visible sugerido en español: **Tesorería y Movimientos**

La plataforma debe soportar:

- uso web
- uso desktop
- operación offline parcial
- sincronización con servidor
- resolución explícita de conflictos
- auditoría
- seguridad por roles y permisos
- crecimiento futuro a módulos como:
  - Accounting Core
  - HR Core
  - Purchases Core
  - Inventory Core
  - CRM Core

## Documentos obligatorios a leer primero

Antes de generar o modificar código, Codex debe leer y respetar estos documentos:

1. `business-platform-master-task-catalog.md`
2. `docs/00-canon/00_project_vision.md`
3. `docs/00-canon/01_architecture_principles.md`
4. `docs/00-canon/02_modular_strategy.md`
5. `docs/00-canon/03_sync_principles.md`
6. `docs/00-canon/04_data_ownership.md`
7. `docs/00-canon/05_ui_principles.md`
8. `docs/00-canon/06_security_and_audit.md`

Si alguno no existe todavía, primero debe proponer su creación según el backlog maestro.

## Decisiones tecnológicas vigentes

### Arquitectura general
- monorepo
- modular monolith
- servidor como source of truth
- sync offline controlado, nunca “full offline libre”
- crecimiento por módulos

### Frontend web
- React
- Vite
- JavaScript
- TailwindCSS 4.1
- Lucide o Phosphor
- diseño premium, profesional, limpio
- no usar Bootstrap

### Desktop
- Tauri
- reutilizar frontend web como base visual
- SQLite local para offline, caché y cola de sync
- bridges nativos solo donde sean necesarios

### Backend
- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Redis para colas/caché cuando aplique
- MinIO o S3 compatible para archivos

### Infraestructura
- Docker para servicios de servidor
- Docker Compose para dev/staging/prod donde aplique
- CI/CD automatizado
- la app desktop final no se distribuye en Docker

## Reglas maestras

1. El servidor es la fuente oficial de verdad.
2. SQLite local no sustituye PostgreSQL central.
3. Ningún módulo nuevo se crea sin blueprint.
4. Ninguna entidad nueva se crea sin ownership definido.
5. Toda acción crítica debe auditarse.
6. Toda pantalla debe contemplar:
   - loading
   - empty
   - error
   - offline
   - sync pending
7. Todo módulo debe declarar su política de sincronización.
8. Los conflictos de sincronización deben poder:
   - aprobar versión local
   - conservar versión servidor
   - descartar local
   - fusionar manualmente
9. No asumir merges automáticos en datos sensibles.
10. No usar Bootstrap.
11. Usar TailwindCSS 4.1.
12. Preferir crecimiento incremental sobre refactors innecesarios.
13. No inventar tareas fuera del backlog maestro sin proponerlas explícitamente.

## Cómo trabajar con el backlog maestro

El archivo `business-platform-master-task-catalog.md` es el catálogo total de tasks.

Codex debe:

- identificar la task activa
- revisar dependencias previas
- no ejecutar tasks fuera de orden si bloquean arquitectura
- generar archivos detallados por task cuando se solicite
- actualizar documentación relacionada al completar una task

## Cómo responder cuando falten documentos

Si un documento canon, blueprint o instruction no existe todavía, Codex debe:

1. identificar cuál falta
2. mapearlo con una task del backlog maestro
3. proponer crearlo primero
4. no avanzar a capas superiores sin esa base si la dependencia es fuerte

## Cómo crear nuevos módulos en el futuro

Todo módulo futuro debe incluir:
- blueprint funcional
- blueprint técnico
- modelos
- migraciones
- backend
- frontend
- permisos
- auditoría
- política offline/sync
- pruebas
- documentación

## Estilo de implementación esperado

- código limpio
- arquitectura consistente
- nombres explícitos
- mínima magia innecesaria
- validaciones claras
- comentarios solo donde aporten valor
- archivos bien organizados por módulo
- evitar mezclar lógica de dominio con UI o bridges locales

## Orden sugerido de construcción inicial

1. governance y canon
2. agents / skills / prompts / instructions
3. monorepo
4. docker / infraestructura local
5. prisma foundation
6. backend foundation
7. frontend foundation
8. desktop foundation
9. sync core
10. Financial Operations Core
11. testing / observabilidad / CI-CD / backups
12. módulos futuros

## Qué hacer antes de tocar código

Antes de implementar cualquier cosa, Codex debe confirmar:
- qué task se está ejecutando
- qué documentos la gobiernan
- qué dependencias previas existen
- qué archivos se deben actualizar además del código


