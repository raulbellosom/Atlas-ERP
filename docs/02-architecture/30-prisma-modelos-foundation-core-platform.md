# Modelos Foundation Iniciales de Core Platform

## Task de origen
- `T-0510` a `T-0514`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Alineación de diseño
- `docs/03-domain-blueprints/core-platform.md`
- `docs/03-domain-blueprints/mapa-entidades-centrales.md`
- `docs/08-codex/agents/prisma-data-agent.md`
- `docs/08-codex/prompts/prisma-data-master-prompt.md`
- `docs/08-codex/skills/prisma-model-skill.md`

## Modelos implementados
- `Organization`
- `Branch`
- `User`
- `Role`
- `Permission`

## Reglas aplicadas
- `id String @id @default(cuid())`.
- `createdAt`/`updatedAt` en todos los modelos.
- `deletedAt` en entidades con soft delete (`Organization`, `Branch`, `User`, `Role`).
- Relación multi-tenant mediante `organizationId` en `Branch`, `User`, `Role`.
- Índices y constraints mínimos para consultas base y unicidad por tenant.

## Índices y unicidad relevantes
- `Organization.slug` único.
- `Branch` único por tenant: `@@unique([organizationId, name])`.
- `User` único por tenant: `@@unique([organizationId, email])`.
- `Role` único por tenant: `@@unique([organizationId, name])`.
- `Permission.key` único global.

## Notas de alcance
- `UserRole` y `RolePermission` se implementan en `T-0515` y `T-0516`.
- Migración foundation se ejecuta en `T-0530`.
