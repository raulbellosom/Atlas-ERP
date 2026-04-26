# Estrategia Prisma de Seeds

## Task de origen
- `T-0509`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Alineación de diseño
- `docs/02-architecture/07-estrategia-seeds-iniciales.md`
- `docs/08-codex/agents/prisma-data-agent.md`
- `docs/08-codex/skills/prisma-model-skill.md`

## Objetivo
Definir una estrategia de seeds reproducible, idempotente y trazable para desarrollo y pruebas.

## Estructura propuesta
- `prisma/seeds/index.ts` como orquestador principal.
- Módulos por dominio:
  - `organizations.seed.ts`
  - `roles.seed.ts`
  - `permissions.seed.ts`
  - `users.seed.ts`
  - `feature-flags.seed.ts`

## Estado de implementación
- Implementado en `T-0531` a `T-0534`:
  - `prisma/seeds/organizations.seed.ts`
  - `prisma/seeds/roles.seed.ts`
  - `prisma/seeds/permissions.seed.ts`
  - `prisma/seeds/users.seed.ts`
- Implementado en `T-0535` y `T-0536`:
  - `prisma/seeds/feature-flags.seed.ts`
  - `prisma/seeds/settings.seed.ts`

## Orden recomendado
1. Organización base
2. Roles
3. Permisos
4. Relación roles-permisos
5. Usuarios iniciales
6. Feature flags y settings

## Reglas operativas
- Seeds idempotentes con `upsert` cuando aplique.
- Sin datos sensibles reales.
- Datos demo separados de datos base mínimos.
- Cambios de seed documentados en task y arquitectura.

## Validación mínima
- `db:seed` debe ejecutarse sin error sobre schema vigente.
- Seeds no deben romper ejecución en base vacía.
