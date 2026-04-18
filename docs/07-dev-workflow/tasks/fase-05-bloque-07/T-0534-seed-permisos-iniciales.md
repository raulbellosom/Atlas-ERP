# T-0534 - Crear seed de permisos iniciales

## Metadatos
- ID: `T-0534`
- Fase: `Fase 5`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear seed idempotente de permisos iniciales y su mapping con roles base.

## Alcance
- Definir catálogo foundation de permisos (`core`, `auth`, `settings`, `feature_flags`, `audit`, `sync`).
- Implementar `upsert` por `Permission.key`.
- Implementar mapping `RolePermission` idempotente por PK compuesta.

## Fuera de alcance
- Permisos de módulos de negocio (`financial`, `accounting`, `hr`, etc.) en fases posteriores.

## Dependencias
- `T-0533` cerrada.

## Criterios de aceptación
- [x] Seed de permisos implementado.
- [x] Mapping rol-permiso implementado e idempotente.
- [x] Re-ejecución mantiene conteos estables.

## Validaciones
- Conteo en PostgreSQL: `permissions = 13`, `role_permissions = 26` tras doble seed.

## Pruebas
- `pnpm --filter @atlasrep/api run db:seed` exitoso.

## Riesgos
- Sin catálogo base de permisos no se puede implementar auth/authorization con granularidad.

## Documentación a actualizar
- `docs/02-architecture/34-prisma-migracion-foundation-y-seeds-core.md`
- `prisma/seeds/permissions.seed.ts`
- `prisma/seeds/index.ts`

## Evidencia documental
- `prisma/seeds/permissions.seed.ts`
- `prisma/seeds/index.ts`

## Pendientes no resueltos
- Ninguno.
