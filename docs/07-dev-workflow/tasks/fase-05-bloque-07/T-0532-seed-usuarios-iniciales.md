# T-0532 - Crear seed de usuarios iniciales

## Metadatos
- ID: `T-0532`
- Fase: `Fase 5`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear seed idempotente de usuarios iniciales y su asignación de rol base.

## Alcance
- Definir usuarios foundation (`admin`, `tesorería`, `auditoría`).
- Implementar `upsert` por (`organizationId`, `email`).
- Asignar `UserRole` con `upsert` de PK compuesta.

## Fuera de alcance
- Passwords, hashes y credenciales de autenticación (Fase 7+).

## Dependencias
- `T-0531` y `T-0533` cerradas.

## Criterios de aceptación
- [x] Seed de usuarios implementado e integrado al pipeline.
- [x] Usuarios quedan vinculados a roles base.
- [x] Re-ejecución no duplica usuarios ni user_roles.

## Validaciones
- Conteo en PostgreSQL: `users = 3`, `user_roles = 3` tras doble seed.

## Pruebas
- `pnpm --filter @atlasrep/api run db:seed` exitoso y repetible.

## Riesgos
- Sin usuarios iniciales se retrasa validación temprana de auth y permisos.

## Documentación a actualizar
- `docs/02-architecture/34-prisma-migracion-foundation-y-seeds-core.md`
- `prisma/seeds/users.seed.ts`
- `prisma/seeds/index.ts`

## Evidencia documental
- `prisma/seeds/users.seed.ts`
- `prisma/seeds/index.ts`

## Pendientes no resueltos
- Ninguno.
