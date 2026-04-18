# Estado de Ejecución - Fase 5 / Bloque 2

## Contexto
- Fecha de cierre de bloque: **2026-04-13**
- Fase 5: Base de datos central y Prisma

## Estado del bloque
- Bloque `T-0505` a `T-0509`: **CERRADO**
- Estado global de Fase 5: **EN CURSO**

## Estado por task
| ID | Título | Estado | Evidencia |
|---|---|---|---|
| T-0505 | Definir convenciones de timestamps | Cerrada | `docs/07-dev-workflow/tasks/fase-05-bloque-02/T-0505-convenciones-timestamps-prisma.md` |
| T-0506 | Definir convenciones de soft delete | Cerrada | `docs/07-dev-workflow/tasks/fase-05-bloque-02/T-0506-convenciones-soft-delete-prisma.md` |
| T-0507 | Definir convenciones de índices | Cerrada | `docs/07-dev-workflow/tasks/fase-05-bloque-02/T-0507-convenciones-indices-prisma.md` |
| T-0508 | Definir convenciones de nombres de migraciones | Cerrada | `docs/07-dev-workflow/tasks/fase-05-bloque-02/T-0508-convenciones-nombres-migraciones-prisma.md` |
| T-0509 | Definir estrategia de seeds | Cerrada | `docs/07-dev-workflow/tasks/fase-05-bloque-02/T-0509-estrategia-seeds-prisma.md` |

## Riesgos residuales
- Las convenciones quedan definidas, pero faltan modelos foundation (`T-0510+`).
- La advertencia deprecada de `package.json#prisma` sigue pendiente de migración a `prisma.config.ts`.
- El pipeline de seed ya ejecuta con `tsx` (Node 22), pero se migrará a configuración Prisma v7 en bloque posterior.

## Pendientes del siguiente bloque
- Iniciar `T-0510` a `T-0514` (modelos foundation iniciales).
