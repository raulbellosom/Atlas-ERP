# Convenciones Prisma de Timestamps

## Task de origen
- `T-0505`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Alineación de diseño
- `docs/08-codex/agents/prisma-data-agent.md`
- `docs/08-codex/prompts/prisma-data-master-prompt.md`
- `docs/08-codex/skills/prisma-model-skill.md`

## Convenciones obligatorias
- Todo modelo persistente debe incluir:
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
- Los nombres de campos deben estar en `camelCase`.
- Las fechas se manejan en UTC desde backend/base de datos.

## Convenciones opcionales por dominio
- `deletedAt DateTime?` para entidades con soft delete.
- `lastSyncedAt DateTime?` para entidades con estrategia de sincronización explícita.

## Reglas de operación
- Prohibido crear entidades sin timestamps base.
- Cambios de semántica de timestamps requieren migración y actualización documental.
- No usar nombres alternos (`created_on`, `updated_on`) para evitar inconsistencia.
