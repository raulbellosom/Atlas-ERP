# T-0538 - Validar integridad de foundation schema

## Metadatos
- ID: `T-0538`
- Fase: `Fase 5`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Ejecutar validación integral del foundation schema para confirmar consistencia estructural y de datos base.

## Alcance
- Validar schema Prisma y generación de cliente.
- Validar estado de migraciones.
- Validar seeds idempotentes.
- Ejecutar checks SQL de integridad referencial y duplicados.

## Fuera de alcance
- Pruebas de performance o volumen productivo.

## Dependencias
- `T-0530` a `T-0537` cerradas.

## Criterios de aceptación
- [x] `prisma validate` sin errores.
- [x] `db:migrate:status` en `up to date`.
- [x] `db:seed` repetible sin duplicados.
- [x] Checks SQL de integridad con resultado limpio.

## Validaciones
- `orphan_user_roles = 0`
- `orphan_role_permissions = 0`
- `duplicate_feature_flag_key = 0`
- `duplicate_setting_scope_key = 0`

## Pruebas
- `db:generate`, `db:migrate:status`, `db:seed`, `reset-db-reseed`.

## Riesgos
- Sin esta validación, errores de integridad podrían propagarse a Fase 6.

## Documentación a actualizar
- `docs/02-architecture/36-prisma-baseline-foundation-schema-v1.md`

## Evidencia documental
- `docs/02-architecture/36-prisma-baseline-foundation-schema-v1.md`

## Pendientes no resueltos
- Ninguno.
