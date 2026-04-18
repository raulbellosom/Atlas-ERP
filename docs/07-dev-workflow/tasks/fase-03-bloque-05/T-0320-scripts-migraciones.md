# T-0320 - Configurar scripts para migraciones

## Metadatos
- ID: `T-0320`
- Fase: `Fase 3`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir el conjunto completo de scripts de migración Prisma para desarrollo y producción, tanto a nivel de app como en la raíz del monorepo.

## Criterios de aceptación
- [x] `apps/api` — scripts de migración completos:
  - `db:migrate` — `prisma migrate dev` (desarrollo, aplica y genera)
  - `db:migrate:prod` — `prisma migrate deploy` (producción, solo aplica)
  - `db:migrate:status` — `prisma migrate status` (diagnóstico)
  - `db:migrate:create` — `prisma migrate dev --create-only` (crea sin aplicar)
  - `db:generate` — `prisma generate` (regenera cliente)
  - `db:studio` — `prisma studio` (GUI local de la BD)
- [x] Raíz — scripts proxy hacia `@atlasrep/api`:
  - `db:migrate`, `db:migrate:prod`, `db:migrate:status`, `db:generate`, `db:studio`

## Archivos modificados
- `apps/api/package.json`
- `package.json` (raíz)

## Decisiones técnicas
- **`migrate dev` vs `migrate deploy`**: `dev` genera migration files y resetea si hay drift. `deploy` solo aplica — para CI/prod.
- **`db:studio` solo en dev**: `prisma studio` no se usa en prod ni CI.
- **`--create-only`**: Permite revisar el SQL generado antes de aplicarlo — útil para migrations complejas.
- **Proxy en raíz**: El desarrollador puede ejecutar cualquier script DB desde la raíz sin navegar a `apps/api/`.

## Pendientes no resueltos
- Ninguno. El schema Prisma (`prisma/schema.prisma`) se crea en Fase 5.
