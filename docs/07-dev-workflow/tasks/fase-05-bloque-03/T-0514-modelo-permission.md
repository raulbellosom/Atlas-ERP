# T-0514 - Crear modelo Permission

## Metadatos
- ID: `T-0514`
- Fase: `Fase 5`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear el modelo `Permission` como catálogo central de capacidades.

## Alcance
- Definir campos `key`, `module`, `action` y metadatos base.
- Definir unicidad global por `key`.
- Definir índices de consulta por módulo/acción.

## Fuera de alcance
- Modelo puente `RolePermission` (`T-0516`).

## Dependencias
- `T-0513` cerrada.

## Criterios de aceptación
- [x] Modelo `Permission` implementado.
- [x] Constraint `@unique` en `key` definida.
- [x] Índices de consulta implementados.

## Validaciones
- `prisma validate` y `db:generate` sin errores.

## Pruebas
- `pnpm --filter @atlasrep/api run db:seed` ejecutado sin errores.

## Riesgos
- Sin catálogo de permisos no se puede cerrar el RBAC foundation.

## Documentación a actualizar
- `docs/02-architecture/30-prisma-modelos-foundation-core-platform.md`
- `prisma/schema.prisma`

## Evidencia documental
- `prisma/schema.prisma`

## Pendientes no resueltos
- Ninguno.
