# Estado de Ejecución - Fase 5 / Bloque 1

## Contexto
- Fecha de cierre de bloque: **2026-04-13**
- Fase 5: Base de datos central y Prisma

## Estado del bloque
- Bloque `T-0500` a `T-0504`: **CERRADO**
- Estado global de Fase 5: **EN CURSO**

## Estado por task
| ID | Título | Estado | Evidencia |
|---|---|---|---|
| T-0500 | Inicializar Prisma | Cerrada | `docs/07-dev-workflow/tasks/fase-05-bloque-01/T-0500-inicializar-prisma.md` |
| T-0501 | Conectar Prisma a PostgreSQL | Cerrada | `docs/07-dev-workflow/tasks/fase-05-bloque-01/T-0501-conectar-prisma-postgresql.md` |
| T-0502 | Definir convenciones del schema Prisma | Cerrada | `docs/07-dev-workflow/tasks/fase-05-bloque-01/T-0502-convenciones-schema-prisma.md` |
| T-0503 | Definir convenciones de enums | Cerrada | `docs/07-dev-workflow/tasks/fase-05-bloque-01/T-0503-convenciones-enums-prisma.md` |
| T-0504 | Definir convenciones de relaciones | Cerrada | `docs/07-dev-workflow/tasks/fase-05-bloque-01/T-0504-convenciones-relaciones-prisma.md` |

## Riesgos residuales
- Aún no existen modelos foundation (`T-0510+`), por lo que Prisma Client no expone entidades de negocio todavía.
- La migración inicial (`T-0530`) sigue pendiente.
- Prisma muestra advertencia deprecada de `package.json#prisma`; se migrará a `prisma.config.ts` en bloque posterior.

## Pendientes del siguiente bloque
- Iniciar `T-0505` a `T-0509`.
