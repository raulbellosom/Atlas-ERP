# T-0529 - Crear enums globales de estado y source

## Metadatos
- ID: `T-0529`
- Fase: `Fase 5`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Definir y aplicar enums globales de estado y source para consistencia semántica en el schema foundation.

## Alcance
- Crear enums globales para `source` reutilizables entre auditoría, sync y notificaciones.
- Crear enums de estado para sesiones, ítems de sync, conflictos, resoluciones, logs, notificaciones y tokens.
- Migrar campos `String` de estado/source en modelos foundation de sync hacia enums.

## Fuera de alcance
- Migración de datos históricos reales (no existe data productiva en este baseline).

## Dependencias
- `T-0525` a `T-0528` cerradas.

## Criterios de aceptación
- [x] Enums globales definidos en `schema.prisma`.
- [x] Campos de estado/source de Foundation migrados a enums.
- [x] `prisma validate` y `db:generate` sin errores por tipado de enums.

## Validaciones
- `prisma validate` sin errores.

## Pruebas
- `db:generate` y `db:seed` exitosos.

## Riesgos
- Mantener strings libres en estados/source incrementa errores de consistencia entre módulos.

## Documentación a actualizar
- `docs/02-architecture/23-prisma-convenciones-enums.md`
- `docs/02-architecture/33-prisma-modelos-foundation-sync-auth-notifications.md`
- `prisma/schema.prisma`

## Evidencia documental
- `prisma/schema.prisma`

## Pendientes no resueltos
- Ninguno.
