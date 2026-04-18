# AtlasERP - Master Task Catalog

## Documento maestro de tasks desde el inicio hasta la entrega completa

> Propósito: este documento **no desarrolla cada task en profundidad**.  
> Su objetivo es definir **todas las tareas necesarias** para construir la plataforma completa, en orden lógico, para que posteriormente una IA genere **un archivo detallado por task** con:
>
> - descripción
> - objetivo
> - alcance
> - dependencias
> - relaciones con otros módulos
> - herramientas a usar
> - criterios de aceptación
> - pruebas
> - validaciones
> - notas técnicas
> - consideraciones futuras

---

# Reglas de uso de este documento

1. **No saltar tareas de Foundation/Core** aunque parezcan “poco visibles”.
2. **No crear módulos de negocio** antes de cerrar plataforma base, seguridad, auditoría y sincronización.
3. **Toda task nueva** debe poder mapearse a una sección de este backlog.
4. **Cada task individual futura** deberá tener su propio archivo markdown.
5. El orden aquí definido es **el orden recomendado de ejecución**, salvo que una task marque explícitamente paralelización posible.
6. El producto final debe quedar listo para:
   - uso web
   - uso desktop
   - operación offline parcial
   - sincronización con resolución de conflictos
   - escalamiento por módulos futuros
7. La plataforma se construirá bajo estas decisiones:
   - monorepo
   - backend central NestJS + Prisma + PostgreSQL
   - frontend web React + Vite + JavaScript + TailwindCSS 4.1
   - desktop Tauri
   - SQLite local para offline/control local
   - Docker para servicios de servidor
   - CI/CD automatizado
   - arquitectura modular monolítica
8. La **fuente oficial de verdad** será siempre el servidor.
9. El primer macro-módulo productivo será **Financial Operations Core / Tesorería y Movimientos**.
10. Este backlog debe llevar eventualmente a un producto completamente funcional al terminar la última task.

---

# Estado operativo actual

- Fecha de actualización: **2026-04-14**
- Modelo de ejecución por task: `docs/07-dev-workflow/00-task-operating-model.md`
- Plantilla estándar de task: `docs/07-dev-workflow/templates/task-detail-template.md`
- Registro general de pendientes por task: `docs/07-dev-workflow/task-pending-registry.md`
- Índice navegable de tasks: `docs/07-dev-workflow/task-index.md`
- Mapa de dependencias: `docs/07-dev-workflow/task-dependency-map.md`
- Criterios de paralelización: `docs/07-dev-workflow/task-parallelization-criteria.md`
- Tableros de bloque:
  - `docs/07-dev-workflow/task-block-00-status.md` a `task-block-09-status.md` (Fase 0)
  - `docs/07-dev-workflow/task-block-10-status.md` a `task-block-19-status.md` (Fase 1)
  - `docs/07-dev-workflow/task-block-20-status.md` a `task-block-28-status.md` (Fase 2)
  - `docs/07-dev-workflow/task-block-29-status.md` a `task-block-37-status.md` (Fase 3)
  - `docs/07-dev-workflow/task-block-38-status.md` (Fase 4)
  - `docs/07-dev-workflow/task-block-39-status.md` (Fase 5 / Bloque 1)
  - `docs/07-dev-workflow/task-block-40-status.md` (Fase 5 / Bloque 2)
  - `docs/07-dev-workflow/task-block-41-status.md` (Fase 5 / Bloque 3)
  - `docs/07-dev-workflow/task-block-42-status.md` (Fase 5 / Bloque 4)
  - `docs/07-dev-workflow/task-block-43-status.md` (Fase 5 / Bloque 5)
  - `docs/07-dev-workflow/task-block-44-status.md` (Fase 5 / Bloque 6)
  - `docs/07-dev-workflow/task-block-45-status.md` (Fase 5 / Bloque 7)
  - `docs/07-dev-workflow/task-block-46-status.md` (Fase 5 / Bloque 8)
  - `docs/07-dev-workflow/task-block-47-status.md` (Fase 6 / Bloque 1)
  - `docs/07-dev-workflow/task-block-48-status.md` a `task-block-56-status.md` (Fase 6 / Bloques 2 a 10)
  - `docs/07-dev-workflow/task-block-57-status.md` a `task-block-62-status.md` (Fase 7 / Bloques 1 a 6)
  - `docs/07-dev-workflow/task-block-63-status.md` a `task-block-71-status.md` (Fase 8 / Bloques 1 a 9)
  - `docs/07-dev-workflow/task-block-72-status.md` a `task-block-76-status.md` (Fase 9 / Bloques 1 a 5)
  - `docs/07-dev-workflow/task-block-77-status.md` (Fase 10 / Bloque 1)
  - `docs/07-dev-workflow/task-block-78-status.md` (Fase 10 / Bloque 2)
  - `docs/07-dev-workflow/task-block-79-status.md` (Fase 10 / Bloque 3)
  - `docs/07-dev-workflow/task-block-80-status.md` a `task-block-87-status.md` (Fase 10 / Bloques 4 a 10)
  - `docs/07-dev-workflow/task-block-88-status.md` (Fase 12 / Bloque 1)
  - `docs/07-dev-workflow/task-block-89-status.md` (Fase 12 / Bloque 2)
  - `docs/07-dev-workflow/task-block-90-status.md` (Fase 12 / Bloque 3)
  - `docs/07-dev-workflow/task-block-91-status.md` (Fase 12 / Bloque 4)
  - `docs/07-dev-workflow/task-block-92-status.md` (Fase 12 / Bloque 5)
  - `docs/07-dev-workflow/task-block-93-status.md` (Fase 13 / Bloque 1)
  - `docs/07-dev-workflow/task-block-94-status.md` (Fase 13 / Bloque 2)
  - `docs/07-dev-workflow/task-block-95-status.md` (Fase 13 / Bloque 3)
  - `docs/07-dev-workflow/task-block-96-status.md` (Fase 13 / Bloque 4)
  - `docs/07-dev-workflow/task-block-97-status.md` (Fase 13 / Bloque 5)
  - `docs/07-dev-workflow/task-block-98-status.md` (Fase 13 / Bloque 6)
  - `docs/07-dev-workflow/task-block-99-status.md` (Fase 13 / Bloque 7)
  - `docs/07-dev-workflow/task-block-100-status.md` (Fase 13 / Bloque 8)
  - `docs/07-dev-workflow/task-block-101-status.md` (Fase 11 / Bloque 3)
  - `docs/07-dev-workflow/task-block-102-status.md` (Fase 11 / Bloque 4)
  - `docs/07-dev-workflow/task-block-103-status.md` (Fase 11 / Bloque 5)
- Bloques cerrados:
  - **Fase 0 / Bloque 1 (`T-0001` a `T-0005`)**
  - **Fase 0 / Bloque 2 (`T-0006` a `T-0010`)**
  - **Fase 0 / Bloque 3 (`T-0011` a `T-0015`)**
  - **Fase 0 / Bloque 4 (`T-0016` a `T-0020`)**
  - **Fase 0 / Bloque 5 (`T-0021` a `T-0025`)**
  - **Fase 0 / Bloque 6 (`T-0026` a `T-0030`)**
  - **Fase 0 / Bloque 7 (`T-0031` a `T-0035`)**
  - **Fase 0 / Bloque 8 (`T-0036` a `T-0040`)**
  - **Fase 0 / Bloque 9 (`T-0041` a `T-0045`)**
  - **Fase 0 / Bloque 10 (`T-0046` a `T-0050`)**
  - **Fase 1 / Bloque 1 (`T-0100` a `T-0104`)**
  - **Fase 1 / Bloque 2 (`T-0105` a `T-0109`)**
  - **Fase 1 / Bloque 3 (`T-0110` a `T-0114`)**
  - **Fase 1 / Bloque 4 (`T-0115` a `T-0119`)**
  - **Fase 1 / Bloque 5 (`T-0120` a `T-0124`)**
  - **Fase 1 / Bloque 6 (`T-0125` a `T-0129`)**
  - **Fase 1 / Bloque 7 (`T-0130` a `T-0134`)**
  - **Fase 1 / Bloque 8 (`T-0135` a `T-0139`)**
  - **Fase 1 / Bloque 9 (`T-0140` a `T-0144`)**
  - **Fase 1 / Bloque 10 (`T-0145` a `T-0149`)**
  - **Fase 2 — COMPLETA (`T-0200` a `T-0240`)**
  - **Fase 3 — COMPLETA (`T-0300` a `T-0340`)**
  - **Fase 4 — COMPLETA (`T-0400` a `T-0429`)**
  - **Fase 5 / Bloque 1 (`T-0500` a `T-0504`)**
  - **Fase 5 / Bloque 2 (`T-0505` a `T-0509`)**
  - **Fase 5 / Bloque 3 (`T-0510` a `T-0514`)**
  - **Fase 5 / Bloque 4 (`T-0515` a `T-0519`)**
  - **Fase 5 / Bloque 5 (`T-0520` a `T-0524`)**
  - **Fase 5 / Bloque 6 (`T-0525` a `T-0529`)**
  - **Fase 5 / Bloque 7 (`T-0530` a `T-0534`)**
  - **Fase 5 / Bloque 8 (`T-0535` a `T-0540`)**
  - **Fase 5 — COMPLETA (`T-0500` a `T-0540`)**
  - **Fase 6 / Bloque 1 (`T-0600` a `T-0604`)**
  - **Fase 6 / Bloque 2 (`T-0605` a `T-0609`)**
  - **Fase 6 / Bloque 3 (`T-0610` a `T-0614`)**
  - **Fase 6 / Bloque 4 (`T-0615` a `T-0619`)**
  - **Fase 6 / Bloque 5 (`T-0620` a `T-0624`)**
  - **Fase 6 / Bloque 6 (`T-0625` a `T-0629`)**
  - **Fase 6 / Bloque 7 (`T-0630` a `T-0634`)**
  - **Fase 6 / Bloque 8 (`T-0635` a `T-0639`)**
  - **Fase 6 / Bloque 9 (`T-0640` a `T-0644`)**
  - **Fase 6 / Bloque 10 (`T-0645` a `T-0646`)**
  - **Fase 6 — COMPLETA (`T-0600` a `T-0646`)**
  - **Fase 7 — COMPLETA (`T-0700` a `T-0726`)**
  - **Fase 8 — COMPLETA (`T-0800` a `T-0840`)**
  - **Fase 9 / Bloque 1 (`T-0900` a `T-0904`)**
  - **Fase 9 / Bloque 2 (`T-0905` a `T-0909`)**
  - **Fase 9 / Bloque 3 (`T-0910` a `T-0914`)**
  - **Fase 9 / Bloque 4 (`T-0915` a `T-0919`)**
  - **Fase 9 / Bloque 5 (`T-0920` a `T-0923`)**
  - **Fase 9 — COMPLETA (`T-0900` a `T-0923`)**
  - **Fase 10 / Bloque 1 (`T-1000` a `T-1004`)**
  - **Fase 10 / Bloque 2 (`T-1005` a `T-1009`)**
  - **Fase 10 / Bloque 3 (`T-1010` a `T-1014`)**
  - **Fase 10 / Bloque 4 (`T-1015` a `T-1019`)**
  - **Fase 10 / Bloque 5 (`T-1020` a `T-1024`)**
  - **Fase 10 / Bloque 6 (`T-1025` a `T-1029`)**
  - **Fase 10 / Bloque 7 (`T-1030` a `T-1034`)**
  - **Fase 10 / Bloque 8 (`T-1035` a `T-1039`)**
  - **Fase 10 / Bloque 9 (`T-1040` a `T-1044`)**
  - **Fase 10 / Bloque 10 (`T-1045` a `T-1046`)**
  - **Fase 10 — COMPLETA (`T-1000` a `T-1046`)**
  - **Fase 11 / Bloque 1 (`T-1100` a `T-1104`)**
  - **Fase 11 / Bloque 2 (`T-1105` a `T-1109`)**
  - **Fase 11 / Bloque 3 (`T-1110` a `T-1114`)**
  - **Fase 11 / Bloque 4 (`T-1115` a `T-1119`)**
  - **Fase 11 / Bloque 5 (`T-1120` a `T-1124`)**
  - **Fase 11 — COMPLETA (`T-1100` a `T-1124`)**
  - **Fase 12 / Bloque 1 (`T-1200` a `T-1204`)**
  - **Fase 12 / Bloque 2 (`T-1205` a `T-1209`)**
  - **Fase 12 / Bloque 3 (`T-1210` a `T-1214`)**
  - **Fase 12 / Bloque 4 (`T-1215` a `T-1219`)**
  - **Fase 12 / Bloque 5 (`T-1220` a `T-1222`)**
  - **Fase 12 — COMPLETA (`T-1200` a `T-1222`)**
  - **Fase 13 / Bloque 1 (`T-1300` a `T-1304`)**
  - **Fase 13 / Bloque 2 (`T-1305` a `T-1309`)**
  - **Fase 13 / Bloque 3 (`T-1310` a `T-1314`)**
  - **Fase 13 / Bloque 4 (`T-1315` a `T-1319`)**
  - **Fase 13 / Bloque 5 (`T-1320` a `T-1324`)**
  - **Fase 13 / Bloque 6 (`T-1325` a `T-1329`)**
  - **Fase 13 / Bloque 7 (`T-1330` a `T-1334`)**
  - **Fase 13 / Bloque 8 (`T-1335` a `T-1337`)**
  - **Fase 13 — COMPLETA (`T-1300` a `T-1337`)**
- Evidencia de cierre por task (bloque 1):
  - `docs/07-dev-workflow/tasks/fase-00-bloque-01/T-0001-nombre-interno-temporal.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-01/T-0002-proposito-negocio-v1.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-01/T-0003-alcance-v1.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-01/T-0004-fuera-de-alcance-v1.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-01/T-0005-vision-3-horizontes.md`
- Evidencia de cierre por task (bloque 2):
  - `docs/07-dev-workflow/tasks/fase-00-bloque-02/T-0006-principios-arquitectonicos-no-negociables.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-02/T-0007-principios-ux-no-negociables.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-02/T-0008-principios-sync-no-negociables.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-02/T-0009-principios-seguridad-auditoria.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-02/T-0010-stack-tecnologico-oficial.md`
- Evidencia de cierre por task (bloque 3):
  - `docs/07-dev-workflow/tasks/fase-00-bloque-03/T-0011-decision-oficial-monorepo.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-03/T-0012-decision-oficial-modular-monolith.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-03/T-0013-servidor-source-of-truth.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-03/T-0014-politica-soporte-offline.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-03/T-0015-politica-resolucion-conflictos.md`
- Evidencia de cierre por task (bloque 4):
  - `docs/07-dev-workflow/tasks/fase-00-bloque-04/T-0016-politica-ownership-datos.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-04/T-0017-estrategia-crecimiento-modulos.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-04/T-0018-nomenclatura-oficial-modulos.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-04/T-0019-nomenclatura-entidades-tablas.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-04/T-0020-nomenclatura-rutas-frontend.md`
- Evidencia de cierre por task (bloque 5):
  - `docs/07-dev-workflow/tasks/fase-00-bloque-05/T-0021-nomenclatura-endpoints-backend.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-05/T-0022-naming-componentes-ui.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-05/T-0023-naming-services-providers.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-05/T-0024-naming-prompts-skills-agents.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-05/T-0025-idioma-principal-i18n.md`
- Evidencia de cierre por task (bloque 6):
  - `docs/07-dev-workflow/tasks/fase-00-bloque-06/T-0026-estructura-oficial-documentación.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-06/T-0027-estructura-oficial-blueprints.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-06/T-0028-estrategia-seeds-iniciales.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-06/T-0029-politica-feature-flags.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-06/T-0030-politica-soft-delete.md`
- Evidencia de cierre por task (bloque 7):
  - `docs/07-dev-workflow/tasks/fase-00-bloque-07/T-0031-politica-archivos-adjuntos.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-07/T-0032-politica-versionado-registros.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-07/T-0033-politica-cambios-esquema.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-07/T-0034-politica-compatibilidad-modulos.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-07/T-0035-criterios-task-terminada.md`
- Evidencia de cierre por task (bloque 8):
  - `docs/07-dev-workflow/tasks/fase-00-bloque-08/T-0036-criterios-modulo-terminado.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-08/T-0037-criterios-release-candidata.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-08/T-0038-politica-branches-prs.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-08/T-0039-politica-commits-convenciones.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-08/T-0040-estrategia-environment-variables.md`
- Evidencia de cierre por task (bloque 9):
  - `docs/07-dev-workflow/tasks/fase-00-bloque-09/T-0041-estrategia-secretos.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-09/T-0042-estrategia-backup.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-09/T-0043-estrategia-restauracion.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-09/T-0044-estrategia-logs.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-09/T-0045-ownership-decisiones-tecnicas.md`
- Evidencia de cierre por task (bloque 10):
  - `docs/07-dev-workflow/tasks/fase-00-bloque-10/T-0046-revision-tasks-ia.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-10/T-0047-politica-cambios-retrocompatibles.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-10/T-0048-politica-breaking-changes.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-10/T-0049-estrategia-backlog-continuo.md`
  - `docs/07-dev-workflow/tasks/fase-00-bloque-10/T-0050-cierre-marco-governance.md`
- Evidencia de cierre — Fase 1:
  - `docs/07-dev-workflow/tasks/fase-01-bloque-01/*` (T-0100 a T-0104)
  - `docs/07-dev-workflow/tasks/fase-01-bloque-02/*` (T-0105 a T-0109)
  - `docs/07-dev-workflow/tasks/fase-01-bloque-03/*` (T-0110 a T-0114)
  - `docs/07-dev-workflow/tasks/fase-01-bloque-04/*` (T-0115 a T-0119)
  - `docs/07-dev-workflow/tasks/fase-01-bloque-05/*` (T-0120 a T-0124)
  - `docs/07-dev-workflow/tasks/fase-01-bloque-06/*` (T-0125 a T-0129)
  - `docs/07-dev-workflow/tasks/fase-01-bloque-07/*` (T-0130 a T-0134)
  - `docs/07-dev-workflow/tasks/fase-01-bloque-08/*` (T-0135 a T-0139)
  - `docs/07-dev-workflow/tasks/fase-01-bloque-09/*` (T-0140 a T-0144)
  - `docs/07-dev-workflow/tasks/fase-01-bloque-10/*` (T-0145 a T-0149)
- Evidencia de cierre — Fase 2:
  - `docs/07-dev-workflow/tasks/fase-02-bloque-01/*` a `fase-02-bloque-09/*` (T-0200 a T-0240)
- Evidencia de cierre — Fase 3:
  - `docs/07-dev-workflow/tasks/fase-03-bloque-01/*` a `fase-03-bloque-09/*` (T-0300 a T-0340)
- Evidencia de cierre — Fase 4:
  - `docs/07-dev-workflow/tasks/fase-04-bloque-01/*` (T-0400 a T-0429)
- Evidencia de cierre — Fase 5 / Bloque 1:
  - `docs/07-dev-workflow/tasks/fase-05-bloque-01/*` (T-0500 a T-0504)
- Evidencia de cierre — Fase 5 / Bloque 2:
  - `docs/07-dev-workflow/tasks/fase-05-bloque-02/*` (T-0505 a T-0509)
- Evidencia de cierre — Fase 5 / Bloque 3:
  - `docs/07-dev-workflow/tasks/fase-05-bloque-03/*` (T-0510 a T-0514)
- Evidencia de cierre — Fase 5 / Bloque 4:
  - `docs/07-dev-workflow/tasks/fase-05-bloque-04/*` (T-0515 a T-0519)
- Evidencia de cierre — Fase 5 / Bloque 5:
  - `docs/07-dev-workflow/tasks/fase-05-bloque-05/*` (T-0520 a T-0524)
- Evidencia de cierre — Fase 5 / Bloque 6:
  - `docs/07-dev-workflow/tasks/fase-05-bloque-06/*` (T-0525 a T-0529)
- Evidencia de cierre — Fase 5 / Bloque 7:
  - `docs/07-dev-workflow/tasks/fase-05-bloque-07/*` (T-0530 a T-0534)
- Evidencia de cierre — Fase 5 / Bloque 8:
  - `docs/07-dev-workflow/tasks/fase-05-bloque-08/*` (T-0535 a T-0540)
- Evidencia de cierre — Fase 6 / Bloque 1:
  - `docs/07-dev-workflow/tasks/fase-06-bloque-01/*` (T-0600 a T-0604)
- Evidencia de cierre — Fase 6 / Bloque 2:
  - `docs/07-dev-workflow/tasks/fase-06-bloque-02/*` (T-0605 a T-0609)
- Evidencia de cierre — Fase 6 / Bloque 3:
  - `docs/07-dev-workflow/tasks/fase-06-bloque-03/*` (T-0610 a T-0614)
- Evidencia de cierre — Fase 6 / Bloque 4:
  - `docs/07-dev-workflow/tasks/fase-06-bloque-04/*` (T-0615 a T-0619)
- Evidencia de cierre — Fase 6 / Bloque 5:
  - `docs/07-dev-workflow/tasks/fase-06-bloque-05/*` (T-0620 a T-0624)
- Evidencia de cierre — Fase 6 / Bloque 6:
  - `docs/07-dev-workflow/tasks/fase-06-bloque-06/*` (T-0625 a T-0629)
- Evidencia de cierre — Fase 6 / Bloque 7:
  - `docs/07-dev-workflow/tasks/fase-06-bloque-07/*` (T-0630 a T-0634)
- Evidencia de cierre — Fase 6 / Bloque 8:
  - `docs/07-dev-workflow/tasks/fase-06-bloque-08/*` (T-0635 a T-0639)
- Evidencia de cierre — Fase 6 / Bloque 9:
  - `docs/07-dev-workflow/tasks/fase-06-bloque-09/*` (T-0640 a T-0644)
- Evidencia de cierre — Fase 6 / Bloque 10:
  - `docs/07-dev-workflow/tasks/fase-06-bloque-10/*` (T-0645 a T-0646)
- Evidencia de cierre — Fase 7:
  - `docs/07-dev-workflow/tasks/fase-07-bloque-01/*` a `fase-07-bloque-06/*` (T-0700 a T-0726)
- Evidencia de cierre — Fase 8:
  - `docs/07-dev-workflow/tasks/fase-08-bloque-01/*` a `fase-08-bloque-09/*` (T-0800 a T-0840)
- Evidencia de cierre — Fase 9:
  - `docs/07-dev-workflow/tasks/fase-09-bloque-01/*` a `fase-09-bloque-05/*` (T-0900 a T-0923)
- Evidencia de cierre — Fase 10 / Bloque 1:
  - `docs/07-dev-workflow/tasks/fase-10-bloque-01/*` (T-1000 a T-1004)
- Evidencia de cierre — Fase 10 / Bloque 2:
  - `docs/07-dev-workflow/tasks/fase-10-bloque-02/*` (T-1005 a T-1009)
- Evidencia de cierre — Fase 10 / Bloque 3:
  - `docs/07-dev-workflow/tasks/fase-10-bloque-03/*` (T-1010 a T-1014)
- Evidencia de cierre — Fase 10 / Bloque 4:
  - `docs/07-dev-workflow/tasks/fase-10-bloque-04/*` (T-1015 a T-1019)
- Evidencia de cierre — Fase 10 / Bloque 5:
  - `docs/07-dev-workflow/tasks/fase-10-bloque-05/*` (T-1020 a T-1024)
- Evidencia de cierre — Fase 10 / Bloque 6:
  - `docs/07-dev-workflow/tasks/fase-10-bloque-06/*` (T-1025 a T-1029)
- Evidencia de cierre — Fase 10 / Bloque 7:
  - `docs/07-dev-workflow/tasks/fase-10-bloque-07/*` (T-1030 a T-1034)
- Evidencia de cierre — Fase 10 / Bloque 8:
  - `docs/07-dev-workflow/tasks/fase-10-bloque-08/*` (T-1035 a T-1039)
- Evidencia de cierre — Fase 10 / Bloque 9:
  - `docs/07-dev-workflow/tasks/fase-10-bloque-09/*` (T-1040 a T-1044)
- Evidencia de cierre — Fase 10 / Bloque 10:
  - `docs/07-dev-workflow/tasks/fase-10-bloque-10/*` (T-1045 a T-1046)
- Evidencia de cierre — Fase 11 / Bloque 1:
  - `docs/07-dev-workflow/tasks/fase-11-bloque-01/*` (T-1100 a T-1104)
- Evidencia de cierre — Fase 12 / Bloque 1:
  - `docs/07-dev-workflow/tasks/fase-12-bloque-01/*` (T-1200 a T-1204)
- Evidencia de cierre — Fase 12 / Bloque 2:
  - `docs/07-dev-workflow/tasks/fase-12-bloque-02/*` (T-1205 a T-1209)
- Evidencia de cierre — Fase 12 / Bloque 3:
  - `docs/07-dev-workflow/tasks/fase-12-bloque-03/*` (T-1210 a T-1214)
- Evidencia de cierre — Fase 12 / Bloque 4:
  - `docs/07-dev-workflow/tasks/fase-12-bloque-04/*` (T-1215 a T-1219)
- Evidencia de cierre — Fase 12 / Bloque 5:
  - `docs/07-dev-workflow/tasks/fase-12-bloque-05/*` (T-1220 a T-1222)
- Evidencia de cierre — Fase 13 / Bloque 1:
  - `docs/07-dev-workflow/tasks/fase-13-bloque-01/*` (T-1300 a T-1304)
- Evidencia de cierre — Fase 13 / Bloque 2:
  - `docs/07-dev-workflow/tasks/fase-13-bloque-02/*` (T-1305 a T-1309)
- Evidencia de cierre — Fase 13 / Bloque 3:
  - `docs/07-dev-workflow/tasks/fase-13-bloque-03/*` (T-1310 a T-1314)
- Evidencia de cierre — Fase 13 / Bloque 4:
  - `docs/07-dev-workflow/tasks/fase-13-bloque-04/*` (T-1315 a T-1319)
- Evidencia de cierre — Fase 13 / Bloque 5:
  - `docs/07-dev-workflow/tasks/fase-13-bloque-05/*` (T-1320 a T-1324)
- Evidencia de cierre — Fase 13 / Bloque 6:
  - `docs/07-dev-workflow/tasks/fase-13-bloque-06/*` (T-1325 a T-1329)
- Evidencia de cierre — Fase 13 / Bloque 7:
  - `docs/07-dev-workflow/tasks/fase-13-bloque-07/*` (T-1330 a T-1334)
- Evidencia de cierre — Fase 13 / Bloque 8:
  - `docs/07-dev-workflow/tasks/fase-13-bloque-08/*` (T-1335 a T-1337)
- Evidencia de cierre — Fase 11 / Bloque 3:
  - `docs/07-dev-workflow/task-block-101-status.md` (T-1110 a T-1114)
- Evidencia de cierre — Fase 11 / Bloque 4:
  - `docs/07-dev-workflow/task-block-102-status.md` (T-1115 a T-1119)
- Evidencia de cierre — Fase 11 / Bloque 5:
  - `docs/07-dev-workflow/task-block-103-status.md` (T-1120 a T-1124)

---

# Convenciones para IDs de tasks

- `T-0001` a `T-0099`: visión, producto y governance
- `T-0100` a `T-0199`: documentación canon y blueprints
- `T-0200` a `T-0299`: monorepo, tooling e infraestructura local
- `T-0300` a `T-0399`: monorepo, paquetes base y tooling
- `T-0400` a `T-0499`: infraestructura local y Docker
- `T-0500` a `T-0599`: base de datos central y Prisma
- `T-0600` a `T-0699`: backend foundation
- `T-0700` a `T-0799`: seguridad, auth, permisos y auditoría
- `T-0800` a `T-0899`: frontend web foundation
- `T-0900` a `T-0999`: desktop foundation
- `T-1000` a `T-1099`: Sync Core completo
- `T-1100` a `T-1199`: design system y UX base
- `T-1200` a `T-1299`: Financial Operations Core (dominio y datos)
- `T-1300` a `T-1399`: Financial Operations Core (backend)
- `T-1400` a `T-1499`: Financial Operations Core (frontend web)
- `T-1500` a `T-1599`: Financial Operations Core (desktop y offline)
- `T-1600` a `T-1699`: reportes, exportaciones y operación funcional
- `T-1700` a `T-1799`: calidad, testing y validación profunda
- `T-1800` a `T-1899`: observabilidad, logs y soporte técnico
- `T-1900` a `T-1999`: CI/CD, deploy y ambientes
- `T-2000` a `T-2099`: backups, restore y continuidad operativa
- `T-2100` a `T-2199`: cierre v1 del producto operativo
- `T-2200` a `T-2299`: preparación estructural para módulos futuros
- `T-2300` a `T-2399`: Accounting Core
- `T-2400` a `T-2499`: HR Core
- `T-2500` a `T-2599`: completitud total del programa

---

# Fase 0 — Visión, definición y governance

## T-0001 Confirmar nombre interno temporal del producto (AtlasERP) - CERRADA

## T-0002 Definir propósito del producto a nivel negocio - CERRADA

## T-0003 Definir alcance de la plataforma v1 - CERRADA

## T-0004 Definir explícitamente qué NO entra en v1 - CERRADA

## T-0005 Definir visión de producto a 3 horizontes: corto, mediano y largo plazo - CERRADA

## T-0006 Definir principios arquitectónicos no negociables - CERRADA

## T-0007 Definir principios UX no negociables - CERRADA

## T-0008 Definir principios de sincronización no negociables - CERRADA

## T-0009 Definir principios de seguridad y auditoría - CERRADA

## T-0010 Definir decisión oficial de stack tecnológico - CERRADA

## T-0011 Definir decisión oficial de monorepo - CERRADA

## T-0012 Definir decisión oficial de modular monolith - CERRADA

## T-0013 Definir decisión oficial de servidor como source of truth - CERRADA

## T-0014 Definir política de soporte offline - CERRADA

## T-0015 Definir política de resolución de conflictos - CERRADA

## T-0016 Definir política de ownership de datos - CERRADA

## T-0017 Definir estrategia de crecimiento por módulos - CERRADA

## T-0018 Definir nomenclatura oficial de módulos - CERRADA

## T-0019 Definir nomenclatura de entidades y tablas - CERRADA

## T-0020 Definir nomenclatura de rutas frontend - CERRADA

## T-0021 Definir nomenclatura de endpoints backend - CERRADA

## T-0022 Definir convención de naming para componentes UI - CERRADA

## T-0023 Definir convención de naming para servicios y providers - CERRADA

## T-0024 Definir convención de naming para prompts, skills y agents - CERRADA

## T-0025 Definir idioma principal del proyecto (español de México) y estándares de i18n - CERRADA

## T-0026 Definir estructura oficial de documentación - CERRADA

## T-0027 Definir estructura oficial de blueprints - CERRADA

## T-0028 Definir estrategia de seeds iniciales - CERRADA

## T-0029 Definir política de feature flags - CERRADA

## T-0030 Definir política de soft delete - CERRADA

## T-0031 Definir política de archivos y adjuntos - CERRADA

## T-0032 Definir política de versionado de registros - CERRADA

## T-0033 Definir política de cambios de esquema - CERRADA

## T-0034 Definir política de compatibilidad entre módulos - CERRADA

## T-0035 Definir criterios de “task terminada” - CERRADA

## T-0036 Definir criterios de “módulo terminado” - CERRADA

## T-0037 Definir criterios de “release candidata” - CERRADA

## T-0038 Definir política de branches y PRs - CERRADA

## T-0039 Definir política de commits y convenciones - CERRADA

## T-0040 Definir estrategia de environment variables - CERRADA

## T-0041 Definir estrategia de secretos - CERRADA

## T-0042 Definir estrategia de backup mínima obligatoria - CERRADA

## T-0043 Definir estrategia de restauración mínima obligatoria - CERRADA

## T-0044 Definir estrategia de logs funcionales y técnicos - CERRADA

## T-0045 Definir estrategia de ownership de decisiones técnicas - CERRADA

## T-0046 Definir estrategia de revisión de tasks generadas por IA - CERRADA

## T-0047 Definir política de cambios retrocompatibles - CERRADA

## T-0048 Definir política de breaking changes internas - CERRADA

## T-0049 Definir estrategia de backlog continuo - CERRADA

## T-0050 Cerrar y aprobar el marco maestro de governance - CERRADA

---

# Fase 1 — Sistema de trabajo para IA: agents, skills, prompts, instructions

## T-0100 Definir el rol del System Architect Agent - CERRADA

## T-0101 Definir el rol del Domain Blueprint Agent - CERRADA

## T-0102 Definir el rol del Prisma/Data Agent - CERRADA

## T-0103 Definir el rol del Backend API Agent - CERRADA

## T-0104 Definir el rol del Frontend Web Agent - CERRADA

## T-0105 Definir el rol del Desktop Agent - CERRADA

## T-0106 Definir el rol del Sync Engine Agent - CERRADA

## T-0107 Definir el rol del DevOps/CI Agent - CERRADA

## T-0108 Definir el rol del QA/Contracts Agent - CERRADA

## T-0109 Definir el rol del Design System Agent - CERRADA

## T-0110 Definir el rol del Documentation Agent - CERRADA

## T-0111 Crear documento maestro de instrucciones globales para Codex - CERRADA

## T-0112 Crear prompt maestro de arquitectura - CERRADA

## T-0113 Crear prompt maestro de backend - CERRADA

## T-0114 Crear prompt maestro de frontend - CERRADA

## T-0115 Crear prompt maestro de desktop - CERRADA

## T-0116 Crear prompt maestro de sync - CERRADA

## T-0117 Crear prompt maestro de Prisma/data - CERRADA

## T-0118 Crear prompt maestro de documentación - CERRADA

## T-0119 Crear prompt maestro de testing - CERRADA

## T-0120 Crear prompt maestro de DevOps - CERRADA

## T-0121 Crear skill de scaffolding de módulos - CERRADA

## T-0122 Crear skill de generación de blueprints - CERRADA

## T-0123 Crear skill de generación de modelos Prisma - CERRADA

## T-0124 Crear skill de creación de endpoints - CERRADA

## T-0125 Crear skill de creación de pantallas frontend - CERRADA

## T-0126 Crear skill de formularios y validaciones - CERRADA

## T-0127 Crear skill de tablas y listados - CERRADA

## T-0128 Crear skill de auditoría - CERRADA

## T-0129 Crear skill de sync policy - CERRADA

## T-0130 Crear skill de resolución de conflictos - CERRADA

## T-0131 Crear skill de integración SQLite local - CERRADA

## T-0132 Crear skill de pruebas unitarias - CERRADA

## T-0133 Crear skill de pruebas E2E - CERRADA

## T-0134 Crear skill de actualización de documentación - CERRADA

## T-0135 Crear plantilla estándar para archivos de task individuales - CERRADA

## T-0136 Crear plantilla estándar para blueprints de dominio - CERRADA

## T-0137 Crear plantilla estándar para blueprints técnicos - CERRADA

## T-0138 Crear plantilla estándar para ADRs/decisiones arquitectónicas - CERRADA

## T-0139 Crear checklist de revisión de task generada por IA - CERRADA

## T-0140 Crear checklist de aceptación por módulo - CERRADA

## T-0141 Crear checklist de release - CERRADA

## T-0142 Crear carpeta oficial de prompts - CERRADA

## T-0143 Crear carpeta oficial de skills - CERRADA

## T-0144 Crear carpeta oficial de instructions - CERRADA

## T-0145 Crear carpeta oficial de templates - CERRADA

## T-0146 Crear índice navegable de tasks maestras - CERRADA

## T-0147 Crear mapa de dependencias entre tasks - CERRADA

## T-0148 Crear criterio para paralelizar tasks sin romper dependencias - CERRADA

## T-0149 Aprobar el sistema operativo de trabajo con IA - CERRADA

---

# Fase 2 — Documentación canon y blueprints base

## T-0200 Crear README maestro del monorepo - CERRADA

## T-0201 Crear documento canon de visión del proyecto - CERRADA

## T-0202 Crear documento canon de principios de arquitectura - CERRADA

## T-0203 Crear documento canon de estrategia modular - CERRADA

## T-0204 Crear documento canon de sincronización - CERRADA

## T-0205 Crear documento canon de ownership de datos - CERRADA

## T-0206 Crear documento canon de seguridad y auditoría - CERRADA

## T-0207 Crear documento canon de diseño y UX - CERRADA

## T-0208 Crear documento canon de environments - CERRADA

## T-0209 Crear documento canon de CI/CD y despliegue - CERRADA

## T-0210 Crear documento canon de convenciones de código - CERRADA

## T-0211 Crear documento canon de testing - CERRADA

## T-0212 Crear blueprint de Core Platform - CERRADA

## T-0213 Crear blueprint de Sync Core - CERRADA

## T-0214 Crear blueprint de Financial Operations Core - CERRADA

## T-0215 Crear blueprint futuro de Accounting Core - CERRADA

## T-0216 Crear blueprint futuro de HR Core - CERRADA

## T-0217 Crear blueprint futuro de Purchases Core - CERRADA

## T-0218 Crear blueprint futuro de Inventory Core - CERRADA

## T-0219 Crear blueprint futuro de CRM Core - CERRADA

## T-0220 Crear blueprint futuro de Notifications Core - CERRADA

## T-0221 Crear blueprint técnico de Web App - CERRADA

## T-0222 Crear blueprint técnico de Desktop App - CERRADA

## T-0223 Crear blueprint técnico de Backend API - CERRADA

## T-0224 Crear blueprint técnico de Worker/Jobs - CERRADA

## T-0225 Crear blueprint técnico de infraestructura Docker - CERRADA

## T-0226 Crear blueprint técnico de SQLite local - CERRADA

## T-0227 Crear blueprint técnico del Sync Center - CERRADA

## T-0228 Crear blueprint técnico de auditoría - CERRADA

## T-0229 Crear blueprint técnico de feature flags - CERRADA

## T-0230 Crear blueprint técnico de archivos y adjuntos - CERRADA

## T-0231 Crear blueprint técnico de observabilidad - CERRADA

## T-0232 Crear blueprint técnico de backups y restore - CERRADA

## T-0233 Crear mapa de entidades centrales compartidas - CERRADA

## T-0234 Crear mapa de relaciones entre módulos actuales y futuros - CERRADA

## T-0235 Crear índice general de blueprints - CERRADA

## T-0236 Revisar consistencia cruzada entre todos los blueprints - CERRADA

## T-0237 Corregir contradicciones entre blueprints - CERRADA

## T-0238 Aprobar set inicial de documentos canon - CERRADA

## T-0239 Aprobar set inicial de blueprints - CERRADA

## T-0240 Congelar baseline documental v1-inicial - CERRADA

---

# Fase 3 — Monorepo, paquetes base y tooling

## T-0300 Inicializar monorepo
- CERRADA

## T-0301 Definir package manager oficial
- CERRADA

## T-0302 Configurar workspaces del monorepo
- CERRADA

## T-0303 Crear apps base: api, web, desktop, worker
- CERRADA

## T-0304 Crear packages base: ui, shared, validation, sync-contracts, sdk
- CERRADA

## T-0305 Configurar lint global
- CERRADA

## T-0306 Configurar format global
- CERRADA

## T-0307 Configurar editorconfig
- CERRADA

## T-0308 Configurar husky o equivalente
- CERRADA

## T-0309 Configurar lint-staged o equivalente
- CERRADA

## T-0310 Configurar path aliases donde aplique
- CERRADA

## T-0311 Configurar scripts raíz del monorepo
- CERRADA

## T-0312 Configurar scripts de dev por app
- CERRADA

## T-0313 Configurar scripts de build por app
- CERRADA

## T-0314 Configurar scripts de test por app
- CERRADA

## T-0315 Configurar scripts de typecheck por app TS
- CERRADA

## T-0316 Configurar scripts de clean
- CERRADA

## T-0317 Configurar scripts de bootstrap inicial
- CERRADA

## T-0318 Configurar scripts para levantar infraestructura local
- CERRADA

## T-0319 Configurar scripts para seeds
- CERRADA

## T-0320 Configurar scripts para migraciones
- CERRADA

## T-0321 Configurar scripts para resets locales
- CERRADA

## T-0322 Configurar scripts para release notes
- CERRADA

## T-0323 Crear estructura de carpetas oficial del backend
- CERRADA

## T-0324 Crear estructura de carpetas oficial del frontend
- CERRADA

## T-0325 Crear estructura de carpetas oficial de desktop
- CERRADA

## T-0326 Crear estructura de carpetas oficial de docs
- CERRADA

## T-0327 Crear estructura de carpetas oficial de tools/prompts/skills
- CERRADA

## T-0328 Configurar estándares de variables de entorno
- CERRADA

## T-0329 Crear `.env.example` raíz
- CERRADA

## T-0330 Crear `.env.example` por app
- CERRADA

## T-0331 Crear validación de env vars en backend
- CERRADA

## T-0332 Crear validación de env vars en frontend
- CERRADA

## T-0333 Crear validación de env vars en worker
- CERRADA

## T-0334 Crear validación de env vars en desktop
- CERRADA

## T-0335 Configurar gestor de cambios de versiones internas
- CERRADA

## T-0336 Crear ADR inicial de estructura de monorepo
- CERRADA

## T-0337 Crear ADR inicial de stack
- CERRADA

## T-0338 Crear ADR inicial de modular monolith
- CERRADA

## T-0339 Crear ADR inicial de sync architecture
- CERRADA

## T-0340 Aprobar baseline del monorepo
- CERRADA

---

# Fase 4 — Infraestructura local y Docker

## T-0400 Definir servicios que correrán en Docker
- CERRADA

## T-0401 Definir servicios que NO correrán en Docker
- CERRADA

## T-0402 Crear `docker-compose.dev.yml`
- CERRADA

## T-0403 Crear `docker-compose.staging.yml`
- CERRADA

## T-0404 Crear `docker-compose.prod.yml`

- CERRADA

## T-0405 Configurar contenedor de PostgreSQL

- CERRADA

## T-0406 Configurar contenedor de Redis

- CERRADA

## T-0407 Configurar contenedor de MinIO/S3 compatible

- CERRADA

## T-0408 Configurar contenedor del backend API

- CERRADA

## T-0409 Configurar contenedor del worker

- CERRADA

## T-0410 Configurar contenedor del frontend web o estático

- CERRADA

## T-0411 Configurar red interna entre servicios

- CERRADA

## T-0412 Configurar volúmenes persistentes

- CERRADA

## T-0413 Configurar healthchecks básicos

- CERRADA

## T-0414 Configurar dependencia entre servicios

- CERRADA

## T-0415 Crear Dockerfile del backend

- CERRADA

## T-0416 Crear Dockerfile del worker

- CERRADA

## T-0417 Crear Dockerfile del frontend web

- CERRADA

## T-0418 Crear scripts de bootstrap docker local

- CERRADA

## T-0419 Crear scripts de reset docker local

- CERRADA

## T-0420 Configurar almacenamiento persistente local de MinIO

- CERRADA

## T-0421 Configurar política base de buckets

- CERRADA

## T-0422 Configurar endpoint interno y externo de archivos

- CERRADA

## T-0423 Configurar variables de entorno de docker

- CERRADA

## T-0424 Crear guía de desarrollo local con docker

- CERRADA

## T-0425 Crear guía de debugging de servicios docker

- CERRADA

## T-0426 Probar arranque completo local en limpio

- CERRADA

## T-0427 Probar teardown limpio

- CERRADA

## T-0428 Probar persistencia tras reinicio

- CERRADA

## T-0429 Aprobar baseline de infraestructura local

- CERRADA

---

# Fase 5 — Base de datos central y Prisma

## T-0500 Inicializar Prisma - CERRADA

## T-0501 Conectar Prisma a PostgreSQL - CERRADA

## T-0502 Definir convenciones del schema Prisma - CERRADA

## T-0503 Definir convenciones de enums - CERRADA

## T-0504 Definir convenciones de relaciones - CERRADA

## T-0505 Definir convenciones de timestamps - CERRADA

## T-0506 Definir convenciones de soft delete - CERRADA

## T-0507 Definir convenciones de índices - CERRADA

## T-0508 Definir convenciones de nombres de migraciones - CERRADA

## T-0509 Definir estrategia de seeds - CERRADA

## T-0510 Crear modelo Organization - CERRADA

## T-0511 Crear modelo Branch - CERRADA

## T-0512 Crear modelo User - CERRADA

## T-0513 Crear modelo Role - CERRADA

## T-0514 Crear modelo Permission - CERRADA

## T-0515 Crear modelo UserRole - CERRADA

## T-0516 Crear modelo RolePermission - CERRADA

## T-0517 Crear modelo AuditLog - CERRADA

## T-0518 Crear modelo Attachment - CERRADA

## T-0519 Crear modelo Setting - CERRADA

## T-0520 Crear modelo FeatureFlag - CERRADA

## T-0521 Crear modelo DeviceRegistry - CERRADA

## T-0522 Crear modelo SyncSession - CERRADA

## T-0523 Crear modelo SyncItem - CERRADA

## T-0524 Crear modelo ConflictRecord - CERRADA

## T-0525 Crear modelo ConflictResolution - CERRADA

## T-0526 Crear modelo SyncLog - CERRADA

## T-0527 Crear modelo Notification - CERRADA

## T-0528 Crear modelo Session/RefreshToken según estrategia - CERRADA

## T-0529 Crear enums globales de estado y source - CERRADA

## T-0530 Generar migración inicial foundation - CERRADA

## T-0531 Crear seed de organization demo - CERRADA

## T-0532 Crear seed de usuarios iniciales - CERRADA

## T-0533 Crear seed de roles iniciales - CERRADA

## T-0534 Crear seed de permisos iniciales - CERRADA

## T-0535 Crear seed de feature flags iniciales - CERRADA

## T-0536 Crear seed de settings iniciales - CERRADA

## T-0537 Crear script de reset con reseed - CERRADA

## T-0538 Validar integridad de foundation schema - CERRADA

## T-0539 Documentar baseline del schema foundation - CERRADA

## T-0540 Aprobar foundation schema v1 - CERRADA

---

# Fase 6 — Backend foundation

## T-0600 Inicializar NestJS en `apps/api` - CERRADA

## T-0601 Configurar estructura modular oficial en backend - CERRADA

## T-0602 Configurar módulo App base - CERRADA

## T-0603 Configurar módulo Prisma - CERRADA

## T-0604 Configurar config module - CERRADA

## T-0605 Configurar logger base

- CERRADA

## T-0606 Configurar exception filter global

- CERRADA

## T-0607 Configurar response interceptor global

- CERRADA

## T-0608 Configurar validation pipe global

- CERRADA

## T-0609 Configurar health module

- CERRADA

## T-0610 Configurar módulo Auth

- CERRADA

## T-0611 Configurar módulo Users

- CERRADA

## T-0612 Configurar módulo Roles

- CERRADA

## T-0613 Configurar módulo Permissions

- CERRADA

## T-0614 Configurar módulo Organizations

- CERRADA

## T-0615 Configurar módulo Branches

- CERRADA

## T-0616 Configurar módulo Settings

- CERRADA

## T-0617 Configurar módulo FeatureFlags

- CERRADA

## T-0618 Configurar módulo Audit

- CERRADA

## T-0619 Configurar módulo Attachments

- CERRADA

## T-0620 Configurar módulo Notifications base

- CERRADA

## T-0621 Configurar módulo Sync base

- CERRADA

## T-0622 Configurar guards de autenticación

- CERRADA

## T-0623 Configurar guards de autorización

- CERRADA

## T-0624 Configurar decorators de permisos

- CERRADA

## T-0625 Configurar decorators de organización/sucursal

- CERRADA

## T-0626 Configurar utilidades comunes

- CERRADA

## T-0627 Configurar DTO conventions

- CERRADA

## T-0628 Configurar paginación base

- CERRADA

## T-0629 Configurar filtros base

- CERRADA

## T-0630 Configurar manejo estándar de errores

- CERRADA

## T-0631 Configurar serialización estándar

- CERRADA

## T-0632 Configurar módulo de archivos con MinIO

- CERRADA

## T-0633 Configurar subida segura de archivos

- CERRADA

## T-0634 Configurar descargas seguras de archivos

- CERRADA

## T-0635 Configurar bitácora automática de acciones críticas
- CERRADA

## T-0636 Configurar módulo de sesiones/refresh tokens
- CERRADA

## T-0637 Configurar login/logout/refresh flow
- CERRADA

## T-0638 Configurar endpoint de perfil actual
- CERRADA

## T-0639 Configurar endpoints base de roles/permisos
- CERRADA

## T-0640 Configurar endpoints base de organizaciones y sucursales
- CERRADA

## T-0641 Configurar endpoints base de settings y feature flags
- CERRADA

## T-0642 Configurar endpoints base de auditoría
- CERRADA

## T-0643 Configurar endpoints base de attachments
- CERRADA

## T-0644 Configurar endpoint healthcheck
- CERRADA

## T-0645 Probar backend foundation end-to-end
- CERRADA

## T-0646 Aprobar backend foundation
- CERRADA

---

# Fase 7 — Seguridad, auth, permisos y auditoría profunda

## T-0700 Definir estrategia final de auth
- CERRADA

## T-0701 Implementar JWT access/refresh o equivalente
- CERRADA

## T-0702 Implementar hashing seguro de contraseñas
- CERRADA

## T-0703 Implementar bootstrap del usuario root
- CERRADA

## T-0704 Implementar política de recuperación de contraseña
- CERRADA

## T-0705 Implementar expiración y revocación de sesiones
- CERRADA

## T-0706 Implementar registro de devices
- CERRADA

## T-0707 Implementar bloqueo de usuarios
- CERRADA

## T-0708 Implementar activación/desactivación de usuarios
- CERRADA

## T-0709 Implementar roles jerárquicos
- CERRADA

## T-0710 Implementar permisos granulares por módulo
- CERRADA

## T-0711 Implementar permisos por acción
- CERRADA

## T-0712 Implementar scoping por organización
- CERRADA

## T-0713 Implementar scoping por sucursal
- CERRADA

## T-0714 Implementar middleware/auditoría de request
- CERRADA

## T-0715 Implementar auditoría de cambios de datos
- CERRADA

## T-0716 Implementar auditoría de login/logout
- CERRADA

## T-0717 Implementar auditoría de sync actions
- CERRADA

## T-0718 Implementar auditoría de resoluciones de conflicto
- CERRADA

## T-0719 Implementar consulta paginada de auditoría
- CERRADA

## T-0720 Implementar filtros avanzados de auditoría
- CERRADA

## T-0721 Implementar protección de endpoints sensibles
- CERRADA

## T-0722 Implementar política de rate limit inicial
- CERRADA

## T-0723 Implementar validación de uploads
- CERRADA

## T-0724 Implementar trazabilidad de archivos
- CERRADA

## T-0725 Implementar pruebas de seguridad básicas
- CERRADA

## T-0726 Aprobar baseline de seguridad y auditoría
- CERRADA

---

# Fase 8 — Frontend web foundation

## T-0800 Inicializar app React + Vite en JavaScript
- CERRADA

## T-0801 Configurar TailwindCSS 4.1
- CERRADA

## T-0802 Configurar sistema de estilos globales
- CERRADA

## T-0803 Configurar router principal
- CERRADA

## T-0804 Configurar estructura modular del frontend
- CERRADA

## T-0805 Configurar layout shell público/privado
- CERRADA

## T-0806 Configurar cliente HTTP/API
- CERRADA

## T-0807 Configurar React Query
- CERRADA

## T-0808 Configurar estado global mínimo
- CERRADA

## T-0809 Configurar manejo de sesión
- CERRADA

## T-0810 Configurar guards de rutas
- CERRADA

## T-0811 Configurar páginas de auth
- CERRADA

## T-0812 Configurar página de dashboard shell
- CERRADA

## T-0813 Configurar módulo visual de settings base
- CERRADA

## T-0814 Configurar módulo visual de users/roles base
- CERRADA

## T-0815 Configurar módulo visual de audit base
- CERRADA

## T-0816 Configurar módulo visual de attachments base
- CERRADA

## T-0817 Configurar sistema de toasts/notificaciones
- CERRADA

## T-0818 Configurar error boundaries
- CERRADA

## T-0819 Configurar empty states base
- CERRADA

## T-0820 Configurar loading states base
- CERRADA

## T-0821 Configurar componentización base reutilizable
- CERRADA

## T-0822 Configurar manejo de formularios
- CERRADA

## T-0823 Configurar validaciones frontend
- CERRADA

## T-0824 Configurar i18n base si aplica
- CERRADA

## T-0825 Configurar modo offline visual base
- CERRADA

## T-0826 Configurar indicador de conexión
- CERRADA

## T-0827 Configurar detector de estado de sync pendiente
- CERRADA

## T-0828 Configurar shell del Sync Center
- CERRADA

## T-0829 Configurar navegación principal por módulos
- CERRADA

## T-0830 Configurar permisos visuales por módulo y acción
- CERRADA

## T-0831 Configurar tema base y design tokens
- CERRADA

## T-0832 Configurar iconografía base
- CERRADA

## T-0833 Configurar tablas base
- CERRADA

## T-0834 Configurar modales base
- CERRADA

## T-0835 Configurar paneles laterales base
- CERRADA

## T-0836 Configurar breadcrumbs base
- CERRADA

## T-0837 Configurar búsqueda global base
- CERRADA

## T-0838 Configurar manejo de errores de API en UI
- CERRADA

## T-0839 Probar frontend foundation en flujo completo
- CERRADA

## T-0840 Aprobar frontend foundation
- CERRADA

---

# Fase 9 — Desktop foundation (Tauri)

## T-0900 Inicializar Tauri en `apps/desktop`
- CERRADA

## T-0901 Integrar frontend React con shell Tauri
- CERRADA

## T-0902 Configurar build local desktop
- CERRADA

## T-0903 Configurar configuración base de ventana
- CERRADA

## T-0904 Configurar branding provisional de la app desktop
- CERRADA

## T-0905 Configurar almacenamiento local seguro
- CERRADA

## T-0906 Configurar bridge de SQLite local
- CERRADA

## T-0907 Configurar bridge de archivos locales
- CERRADA

## T-0908 Configurar bridge de impresión/exportación
- CERRADA

## T-0909 Configurar bridge de estado de red
- CERRADA

## T-0910 Configurar bridge de actualizaciones futuras
- CERRADA

## T-0911 Configurar directorios locales de datos
- CERRADA

## T-0912 Configurar creación inicial de base SQLite
- CERRADA

## T-0913 Configurar migraciones locales SQLite si aplica
- CERRADA

## T-0914 Configurar repositorios locales para cola de sync
- CERRADA

## T-0915 Configurar sesión local desktop
- CERRADA

## T-0916 Configurar arranque desktop autenticado
- CERRADA

## T-0917 Configurar arranque desktop offline
- CERRADA

## T-0918 Configurar panel local de estado de sincronización
- CERRADA

## T-0919 Configurar recuperación de cola local tras reinicio
- CERRADA

## T-0920 Configurar logs locales desktop
- CERRADA

## T-0921 Configurar manejo de conflictos descargados
- CERRADA

## T-0922 Configurar pruebas básicas de shell desktop
- CERRADA

## T-0923 Aprobar desktop foundation
- CERRADA

---

# Fase 10 — Sync Core completo

## T-1000 Definir contrato de sincronización global
- CERRADA

## T-1001 Definir tipos de entidades sincronizables
- CERRADA

## T-1002 Definir tipos de operaciones sincronizables
- CERRADA

## T-1003 Definir esquema de payload de sync
- CERRADA

## T-1004 Definir versionado de payloads
- CERRADA

## T-1005 Definir estrategia de cola local
- CERRADA

## T-1006 Definir estrategia de retries
- CERRADA

## T-1007 Definir estrategia de idempotencia
- CERRADA

## T-1008 Definir estrategia de detección de duplicados
- CERRADA

## T-1009 Definir estrategia de conflictos
- CERRADA

## T-1010 Definir estrategia de aprobación/rechazo
- CERRADA

## T-1011 Definir reglas por entidad para offline permitido/no permitido
- CERRADA

## T-1012 Implementar tabla/local storage de queue en SQLite
- CERRADA

## T-1013 Implementar repositorio local de sync items
- CERRADA

## T-1014 Implementar servicio local de enqueue
- CERRADA

## T-1015 Implementar servicio local de dequeue controlado
- CERRADA

## T-1016 Implementar worker local o cliente de sincronización
- CERRADA

## T-1017 Implementar endpoints backend de sync batch
- CERRADA

## T-1018 Implementar validación backend de sync items
- CERRADA

## T-1019 Implementar persistencia backend de SyncSession
- CERRADA

## T-1020 Implementar persistencia backend de SyncItem
- CERRADA

## T-1021 Implementar persistencia backend de ConflictRecord
- CERRADA

## T-1022 Implementar persistencia backend de ConflictResolution
- CERRADA

## T-1023 Implementar logs de sync
- CERRADA

## T-1024 Implementar comparador de versiones local/server
- CERRADA

## T-1025 Implementar resolución automática solo donde sea seguro
- CERRADA

## T-1026 Implementar rechazo explícito de merges peligrosos
- CERRADA

## T-1027 Implementar diff mínimo entre registros
- CERRADA

## T-1028 Implementar centro de conflictos en backend
- CERRADA

## T-1029 Implementar UI del Sync Center: pendientes
- CERRADA

## T-1030 Implementar UI del Sync Center: sincronizados
- CERRADA

## T-1031 Implementar UI del Sync Center: rechazados
- CERRADA

## T-1032 Implementar UI del Sync Center: conflictos
- CERRADA

## T-1033 Implementar UI del Sync Center: historial
- CERRADA

## T-1034 Implementar UI de detalle de conflicto
- CERRADA

## T-1035 Implementar acciones de aprobar local
- CERRADA

## T-1036 Implementar acciones de conservar servidor
- CERRADA

## T-1037 Implementar acciones de descartar local
- CERRADA

## T-1038 Implementar acciones de merge manual
- CERRADA

## T-1039 Implementar permisos para resolución de conflictos
- CERRADA

## T-1040 Implementar auditoría de resolución de conflictos
- CERRADA

## T-1041 Implementar pruebas E2E de sync online->offline->online
- CERRADA

## T-1042 Implementar pruebas de conflictos de edición
- CERRADA

## T-1043 Implementar pruebas de duplicados
- CERRADA

## T-1044 Implementar pruebas de rechazo por regla de negocio
- CERRADA

## T-1045 Implementar pruebas de persistencia de cola tras reinicio
- CERRADA

## T-1046 Aprobar Sync Core v1
- CERRADA

---

# Fase 11 — Design System y UX base profesional

## T-1100 Definir tokens de color
- CERRADA

## T-1101 Definir tokens de tipografía
- CERRADA

## T-1102 Definir tokens de spacing
- CERRADA

## T-1103 Definir tokens de radio/shadow
- CERRADA

## T-1104 Definir semántica de colores de estados
- CERRADA

## T-1105 Definir sistema de badges
- CERRADA

## T-1106 Definir sistema de botones
- CERRADA

## T-1107 Definir sistema de inputs
- CERRADA

## T-1108 Definir sistema de selectores
- CERRADA

## T-1109 Definir sistema de tablas
- CERRADA

## T-1110 Definir sistema de cards
- CERRADA

## T-1111 Definir sistema de modales
- CERRADA

## T-1112 Definir sistema de side panels
- CERRADA

## T-1113 Definir sistema de tabs
- CERRADA

## T-1114 Definir sistema de breadcrumbs
- CERRADA

## T-1115 Definir sistema de toasts
- CERRADA

## T-1116 Definir sistema de skeleton loaders
- CERRADA

## T-1117 Definir sistema de gráficos/resúmenes
- CERRADA

## T-1118 Definir sistema de layout responsive
- CERRADA

## T-1119 Implementar componentes foundation en `packages/ui`
- CERRADA

## T-1120 Implementar documentación visual del design system
- CERRADA

## T-1121 Implementar ejemplos de uso
- CERRADA

## T-1122 Implementar accesibilidad base de componentes
- CERRADA

## T-1123 Implementar consistencia desktop/web en UI compartida
- CERRADA

## T-1124 Aprobar design system foundation
- CERRADA

---

# Fase 12 — Financial Operations Core: dominio y datos

## T-1200 Refinar blueprint de Financial Operations Core
- CERRADA

## T-1201 Definir alcance exacto de v1 de Tesorería y Movimientos
- CERRADA

## T-1202 Definir fuera de alcance del módulo
- CERRADA

## T-1203 Definir entidades del módulo
- CERRADA

## T-1204 Definir relaciones del módulo con Core Platform
- CERRADA

## T-1205 Definir relaciones del módulo con Sync Core
- CERRADA

## T-1206 Definir evolución futura hacia Accounting Core
- CERRADA

## T-1207 Crear modelo BankAccount
- CERRADA

## T-1208 Crear modelo BankAccountType si aplica
- CERRADA

## T-1209 Crear modelo FinancialMovement
- CERRADA

## T-1210 Crear modelo FinancialMovementAttachment
- CERRADA

## T-1211 Crear modelo Transfer
- CERRADA

## T-1212 Crear modelo ReconciliationSession
- CERRADA

## T-1213 Crear modelo ReconciliationItem
- CERRADA

## T-1214 Crear modelo BalanceSnapshot
- CERRADA

## T-1215 Crear modelo CounterpartyLite si aplica
- CERRADA

## T-1216 Crear modelo ReceivableLite
- CERRADA

## T-1217 Crear modelo PayableLite
- CERRADA

## T-1218 Crear enums del módulo
- CERRADA

## T-1219 Crear migraciones del módulo
- CERRADA

## T-1220 Crear seeds de datos demo del módulo
- CERRADA

## T-1221 Validar integridad del esquema del módulo
- CERRADA

## T-1222 Aprobar dominio y esquema del módulo
- CERRADA

---

# Fase 13 — Financial Operations Core: backend

## T-1300 Crear módulo backend BankAccounts
- CERRADA

## T-1301 Crear módulo backend FinancialMovements
- CERRADA

## T-1302 Crear módulo backend Transfers
- CERRADA

## T-1303 Crear módulo backend Reconciliation
- CERRADA

## T-1304 Crear módulo backend BalanceSnapshots
- CERRADA

## T-1305 Crear módulo backend ReceivablesLite
- CERRADA

## T-1306 Crear módulo backend PayablesLite
- CERRADA

## T-1307 Crear DTOs de BankAccount
- CERRADA

## T-1308 Crear DTOs de FinancialMovement
- CERRADA

## T-1309 Crear DTOs de Transfer
- CERRADA

## T-1310 Crear DTOs de Reconciliation
- CERRADA

## T-1311 Crear DTOs de ReceivablesLite
- CERRADA

## T-1312 Crear DTOs de PayablesLite
- CERRADA

## T-1313 Crear servicios de BankAccount
- CERRADA

## T-1314 Crear servicios de FinancialMovement
- CERRADA

## T-1315 Crear servicios de Transfer
- CERRADA

## T-1316 Crear servicios de Reconciliation
- CERRADA

## T-1317 Crear servicios de BalanceSnapshot
- CERRADA

## T-1318 Crear servicios de ReceivablesLite
- CERRADA

## T-1319 Crear servicios de PayablesLite
- CERRADA

## T-1320 Crear endpoints CRUD de cuentas bancarias
- CERRADA

## T-1321 Crear endpoints CRUD de movimientos
- CERRADA

## T-1322 Crear endpoints CRUD de transferencias
- CERRADA

## T-1323 Crear endpoints CRUD de cuentas por cobrar simples
- CERRADA

## T-1324 Crear endpoints CRUD de cuentas por pagar simples
- CERRADA

## T-1325 Crear endpoint de balance por cuenta
- CERRADA

## T-1326 Crear endpoint de listado de movimientos por filtros
- CERRADA

## T-1327 Crear endpoint de resumen de saldos
- CERRADA

## T-1328 Crear endpoint de conciliación
- CERRADA

## T-1329 Crear endpoint de cierre/aprobación de conciliación si aplica
- CERRADA

## T-1330 Integrar uploads/comprobantes a movimientos
- CERRADA

## T-1331 Integrar auditoría de acciones críticas del módulo
- CERRADA

## T-1332 Integrar permisos del módulo
- CERRADA

## T-1333 Integrar soporte de sync del módulo
- CERRADA

## T-1334 Crear pruebas unitarias del módulo
- CERRADA

## T-1335 Crear pruebas de integración del módulo
- CERRADA

## T-1336 Crear pruebas de permisos del módulo
- CERRADA

## T-1337 Aprobar backend del módulo
- CERRADA

---

# Fase 14 — Financial Operations Core: Frontend Web

## T-1400 Layout y navegación FinOps
- CERRADA

## T-1401 Entidad BankAccounts: listado
- CERRADA

## T-1402 Entidad BankAccounts: creación
- CERRADA

## T-1403 Entidad BankAccounts: edición
- CERRADA

## T-1404 Entidad BankAccounts: detalle
- CERRADA

## T-1405 Entidad FinancialMovements: listado completo
- CERRADA

## T-1406 Entidad FinancialMovements: filtros avanzados
- CERRADA

## T-1407 Entidad FinancialMovements: creación
- CERRADA

## T-1408 Entidad FinancialMovements: anulación y edición
- CERRADA

## T-1409 Entidad FinancialMovements: detalle
- CERRADA

## T-1410 Entidad Transfers: listado
- CERRADA

## T-1411 Entidad Transfers: creación (asistente)
- CERRADA

## T-1412 Entidad Transfers: aprobación
- CERRADA

## T-1413 Entidad Transfers: detalle y rastreo de doble partida
- CERRADA

## T-1414 Entidad Attachments: visor para movimientos/transferencias
- CERRADA

## T-1415 Entidad Reconciliation: sesiones (listado y creación)
- CERRADA

## T-1416 Entidad Reconciliation: wizard / pantalla interactiva
- CERRADA

## T-1417 Entidad BalanceSnapshots: resumen global
- CERRADA

## T-1418 Entidad CxC/CxP: listados y visualización (Receivables/Payables)
- CERRADA

## T-1419 Interfaz y control de estados (Loading/Empty/Error)
- CERRADA

## T-1420 Interfaz Offline Banner y UX
- CERRADA

## T-1421 Prevención de pérdida de forms (useUnsavedChanges)
- CERRADA

## T-1422 Seguridad de requests (Validadores preventivos)
- CERRADA

## T-1423 Refinamiento de accesibilidad y linting
- CERRADA

## T-1424 Generación de build testeado sin errores
- CERRADA

## T-1425 Setup E2E
- CERRADA

## T-1426 Cierre final Fase 14 y documentacion
- CERRADA


# Fase 15 — Financial Operations Core: desktop y offline

## T-1500 Definir qué operaciones del módulo se permiten offline
## T-1501 Definir qué operaciones del módulo NO se permiten offline
## T-1502 Crear repositorios SQLite del módulo
## T-1503 Crear caché local de cuentas bancarias
## T-1504 Crear caché local de movimientos
## T-1505 Crear caché local de saldos/resúmenes necesarios
## T-1506 Crear formularios desktop con persistencia local
## T-1507 Crear enqueue local de movimientos offline
## T-1508 Crear enqueue local de transferencias offline
## T-1509 Crear enqueue local de CxC/CxP simples offline
## T-1510 Crear visualización de items pendientes por sincronizar
## T-1511 Crear recuperación local tras reinicio
## T-1512 Crear UI desktop del Sync Center integrada al módulo
## T-1513 Crear gestión local de adjuntos
## T-1514 Crear reglas para bloquear operaciones incompatibles offline
## T-1515 Crear pruebas offline->sync del módulo
## T-1516 Aprobar desktop/offline del módulo

---

# Fase 16 — Reportes, exportaciones y operación funcional

## T-1600 Definir reportes mínimos de v1 - CERRADA
## T-1601 Crear reporte de movimientos por rango - CERRADA
## T-1602 Crear reporte de movimientos por cuenta - CERRADA
## T-1603 Crear reporte de saldos por cuenta - CERRADA
## T-1604 Crear reporte de transferencias - CERRADA
## T-1605 Crear reporte de cuentas por cobrar simples - CERRADA
## T-1606 Crear reporte de cuentas por pagar simples - CERRADA
## T-1607 Crear exportación CSV de movimientos - CERRADA
## T-1608 Crear exportación XLSX de movimientos - CERRADA
## T-1609 Crear exportación PDF de listados clave - CERRADA
## T-1610 Crear impresión de reportes desde desktop - CERRADA
## T-1611 Crear impresión de comprobantes/resúmenes si aplica - CERRADA
## T-1612 Crear filtros reutilizables de reportes - CERRADA
## T-1613 Crear auditoría de exportaciones si aplica - CERRADA
## T-1614 Validar rendimiento de reportes base - CERRADA
## T-1615 Aprobar capa operativa/reportes v1 - CERRADA

---

# Fase 17 — Calidad, testing y validación profunda

## T-1700 Definir strategy de testing por capas
## T-1701 Configurar tests unitarios backend
## T-1702 Configurar tests de integración backend
## T-1703 Configurar tests E2E backend
## T-1704 Configurar tests de frontend
## T-1705 Configurar tests de componentes UI
## T-1706 Configurar tests desktop críticos
## T-1707 Configurar tests de Sync Core
## T-1708 Configurar datos de prueba realistas
## T-1709 Crear matriz de escenarios de negocio v1
## T-1710 Crear matriz de escenarios offline
## T-1711 Crear matriz de escenarios de conflicto
## T-1712 Crear matriz de escenarios de permisos
## T-1713 Crear matriz de regresión v1
## T-1714 Crear smoke tests de apps
## T-1715 Crear smoke tests post-deploy
## T-1716 Crear pruebas de restauración de backups
## T-1717 Crear pruebas de persistencia local SQLite
## T-1718 Crear pruebas de corrupción o fallo parcial de sync
## T-1719 Crear pruebas de idempotencia en sync
## T-1720 Crear pruebas de performance base
## T-1721 Crear pruebas de carga básicas del backend
## T-1722 Corregir defectos encontrados
## T-1723 Aprobar baseline de calidad v1

---

# Fase 18 — Observabilidad, logs y soporte técnico

## T-1800 Definir estrategia de logging estructurado
## T-1801 Implementar logs backend
## T-1802 Implementar logs worker
## T-1803 Implementar logs de sync
## T-1804 Implementar logs desktop locales
## T-1805 Implementar tracking de errores frontend
## T-1806 Implementar tracking de errores desktop
## T-1807 Implementar métricas de health
## T-1808 Implementar métricas de jobs
## T-1809 Implementar métricas de sync
## T-1810 Implementar métricas de conflictos
## T-1811 Implementar dashboard mínimo de operación
## T-1812 Crear guía de troubleshooting
## T-1813 Crear guía de debugging de sync
## T-1814 Crear guía de debugging desktop
## T-1815 Aprobar observabilidad mínima operativa

---

# Fase 19 — CI/CD, deploy y ambientes

## T-1900 Definir ambientes: dev, staging, prod
## T-1901 Crear workflow de PR
## T-1902 Crear workflow de main
## T-1903 Crear workflow de build backend
## T-1904 Crear workflow de build frontend
## T-1905 Crear workflow de build worker
## T-1906 Crear workflow de build desktop
## T-1907 Crear workflow de tests automáticos
## T-1908 Crear workflow de lint/typecheck
## T-1909 Crear workflow de validación de Prisma
## T-1910 Crear pipeline de imágenes docker
## T-1911 Crear pipeline de publicación de imágenes
## T-1912 Crear pipeline de despliegue a staging
## T-1913 Crear pipeline de despliegue a producción
## T-1914 Integrar migraciones Prisma al deploy
## T-1915 Integrar healthchecks post-deploy
## T-1916 Integrar rollback si healthcheck falla
## T-1917 Crear estrategia de release de frontend web
## T-1918 Crear estrategia de release de backend
## T-1919 Crear estrategia de release de desktop
## T-1920 Crear versionado semántico de artefactos
## T-1921 Crear changelog automatizado
## T-1922 Crear documentación de deploy
## T-1923 Aprobar pipeline CI/CD v1

---

# Fase 20 — Backups, restore y continuidad operativa

## T-2000 Definir backup policy de PostgreSQL
## T-2001 Definir backup policy de archivos
## T-2002 Definir backup policy de configs
## T-2003 Definir backup policy de desktop local
## T-2004 Implementar dumps automáticos PostgreSQL
## T-2005 Implementar retención de backups
## T-2006 Implementar backup de buckets/archivos
## T-2007 Implementar scripts de restore
## T-2008 Documentar procedimiento de restore completo
## T-2009 Probar restore completo en staging
## T-2010 Probar restore parcial de módulo
## T-2011 Probar restore de archivos
## T-2012 Probar recuperación local SQLite
## T-2013 Aprobar continuidad operativa mínima

---

# Fase 21 — Cierre v1 del producto operativo

## T-2100 Ejecutar checklist integral de completitud
## T-2101 Revisar que no existan huecos documentales
## T-2102 Revisar que no existan huecos de permisos
## T-2103 Revisar que no existan huecos de auditoría
## T-2104 Revisar que no existan huecos de sync
## T-2105 Revisar que no existan huecos de UX
## T-2106 Revisar que no existan huecos de desktop
## T-2107 Revisar que no existan huecos de CI/CD
## T-2108 Revisar que no existan huecos de backups
## T-2109 Corregir hallazgos de cierre v1
## T-2110 Ejecutar UAT interno
## T-2111 Ejecutar bugfixing de UAT interno
## T-2112 Congelar release candidate v1
## T-2113 Aprobar release v1 de Business Platform Core + Financial Operations Core

---

# Fase 22 — Preparación estructural para módulos futuros

## T-2200 Refinar blueprint de Accounting Core posterior a v1
## T-2201 Refinar blueprint de HR Core posterior a v1
## T-2202 Refinar blueprint de Purchases Core posterior a v1
## T-2203 Refinar blueprint de Inventory Core posterior a v1
## T-2204 Definir contratos de integración entre Financial Ops y Accounting
## T-2205 Definir contratos de integración entre Financial Ops y HR
## T-2206 Definir contratos de integración entre Financial Ops y Purchases
## T-2207 Definir contratos de integración entre Financial Ops y Inventory
## T-2208 Definir estrategia de posting contable desde Financial Ops
## T-2209 Definir estrategia de pagos de nómina futura
## T-2210 Definir estrategia de egresos/compras futuras
## T-2211 Definir estrategia de linking con inventario/activos
## T-2212 Aprobar preparación de expansión modular

---

# Fase 23 — Accounting Core (módulo futuro completo)

## T-2300 Refinar alcance de Accounting Core
## T-2301 Definir entidades contables
## T-2302 Crear modelos contables en Prisma
## T-2303 Crear migraciones contables
## T-2304 Crear seeds contables demo
## T-2305 Crear módulo backend ChartOfAccounts
## T-2306 Crear módulo backend JournalEntries
## T-2307 Crear módulo backend JournalLines
## T-2308 Crear módulo backend Ledger
## T-2309 Crear reglas de posting desde Financial Ops
## T-2310 Crear endpoints contables base
## T-2311 Crear UI web del catálogo contable
## T-2312 Crear UI web de pólizas/asientos
## T-2313 Crear UI web de mayor auxiliar
## T-2314 Crear UI web de balanza
## T-2315 Crear validaciones contables
## T-2316 Crear reportes contables base
## T-2317 Crear integración con sync donde aplique
## T-2318 Crear pruebas contables
## T-2319 Aprobar Accounting Core

---

# Fase 24 — HR Core (módulo futuro completo)

## T-2400 Refinar alcance de HR Core
## T-2401 Definir entidades de HR
## T-2402 Crear modelos HR en Prisma
## T-2403 Crear migraciones HR
## T-2404 Crear seeds HR demo
## T-2405 Crear módulo backend Employees
## T-2406 Crear módulo backend Departments
## T-2407 Crear módulo backend Positions
## T-2408 Crear módulo backend Attendance
## T-2409 Crear módulo backend Incidents
## T-2410 Crear módulo backend Contracts/Documents
## T-2411 Crear endpoints HR base
## T-2412 Crear UI web de empleados
## T-2413 Crear UI web de asistencia
## T-2414 Crear UI web de incidencias
## T-2415 Crear UI web de documentos HR
## T-2416 Crear permisos HR
## T-2417 Crear reportes HR base
## T-2418 Crear integración con Financial Ops si aplica
## T-2419 Crear integración con futuras nóminas
## T-2420 Crear pruebas HR
## T-2421 Aprobar HR Core

---

# Fase 25 — Completitud total del programa

## T-2500 Verificar que la plataforma soporte agregar módulos sin refactor crítico
## T-2501 Verificar que la documentación explique cómo agregar módulos nuevos
## T-2502 Verificar que exista task template para futuros módulos
## T-2503 Verificar que exista module scaffold skill lista para reutilización
## T-2504 Verificar que exista criterio de ownership por módulo
## T-2505 Verificar que exista criterio offline por módulo
## T-2506 Verificar que exista criterio de permisos por módulo
## T-2507 Verificar que exista criterio de auditoría por módulo
## T-2508 Verificar que exista criterio de reporting por módulo
## T-2509 Verificar que exista criterio de testing por módulo
## T-2510 Verificar que exista criterio de CI/CD por módulo
## T-2511 Verificar que exista criterio de deploy y rollback por módulo
## T-2512 Verificar que exista criterio de backups por módulo
## T-2513 Verificar que exista roadmap posterior a v1
## T-2514 Cerrar backlog maestro base
## T-2515 Declarar plataforma lista para evolución continua

---

# Dependencias maestras resumidas

## No empezar antes de:
- `T-0050` para arquitectura y governance
- `T-0149` para sistema de trabajo con IA
- `T-0240` para documentación canon y blueprints
- `T-0340` para monorepo base
- `T-0429` para infraestructura local
- `T-0540` para foundation schema
- `T-0646` para backend foundation
- `T-0840` para frontend foundation
- `T-0923` para desktop foundation
- `T-1046` para Sync Core
- `T-1222` para dominio de Financial Operations
- `T-1337` para backend del módulo
- `T-1426` para frontend web del módulo
- `T-1516` para desktop/offline del módulo
- `T-1723` para baseline de calidad
- `T-1923` para CI/CD
- `T-2013` para continuidad operativa
- `T-2113` para release v1 cerrada

---

# Recomendación de ejecución con IA

## Orden ideal de trabajo
1. convertir este documento en backlog navegable
2. generar un archivo markdown por cada task prioritaria
3. generar primero las tasks de:
   - Fase 0
   - Fase 1
   - Fase 2
   - Fase 3
   - Fase 4
4. después generar tasks técnicas ejecutables de foundation
5. después generar Sync Core
6. después generar Financial Operations Core
7. después calidad, deploy y cierre v1
8. luego módulos futuros


## Regla operativa

Ninguna IA debe inventar tareas fuera de este catálogo sin:

- proponer el cambio
- justificarlo
- ubicarlo en fase
- añadir dependencia
- actualizar el índice maestro

---

# Resultado esperado al terminar la última task

Al concluir la última task, el sistema debe quedar con:

- plataforma modular funcional
- backend central estable
- web app funcional
- desktop app funcional
- offline parcial operativo
- sincronización con revisión de conflictos
- auditoría
- seguridad y permisos
- CI/CD
- backups y restore
- módulo Financial Operations Core listo
- base preparada para Accounting Core y HR Core
- sistema documental y operativo listo para seguir creciendo

---

# Siguiente uso recomendado

Usar este documento para pedirle a la IA:

> “Genera el archivo detallado de la task T-XXXX siguiendo la plantilla estándar del proyecto, incluyendo descripción, objetivo, alcance, fuera de alcance, dependencias, relaciones, tools, criterios de aceptación, validaciones, pruebas, riesgos, notas técnicas y documentación a actualizar.”


