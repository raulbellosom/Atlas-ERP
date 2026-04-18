# Modelos Foundation de Feature Flags y Sync

## Task de origen
- `T-0520` a `T-0524`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Alineación de diseño
- `docs/03-domain-blueprints/blueprint-tecnico-feature-flags.md`
- `docs/03-domain-blueprints/sync-core.md`
- `docs/03-domain-blueprints/blueprint-tecnico-sync-center.md`
- `docs/08-codex/agents/sync-engine-agent.md`
- `docs/08-codex/prompts/sync-master-prompt.md`

## Modelos implementados
- `FeatureFlag`
- `DeviceRegistry`
- `SyncSession`
- `SyncItem`
- `ConflictRecord`

## Criterios aplicados
- Scope multi-tenant con `organizationId` en modelos de sync.
- Campos de trazabilidad temporal (`createdAt`, `updatedAt`, `processedAt`, `resolvedAt`).
- Payloads de sync y conflictos en JSON (`payload`, `localPayload`, `serverPayload`).
- Índices de consulta por estado, entidad y organización.

## Notas de alcance
- `ConflictResolution` y `SyncLog` se incorporan en el siguiente bloque (`T-0525` y `T-0526`).
- Los estados/orígenes se consolidan con enums globales en `T-0529`.
- Se mantiene compatibilidad con Sync Center para resolución manual.
