# Reglas Offline por Entidad

## ID de definición
- Task origen: `T-1011`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Política oficial
No todas las entidades pueden operar offline. Cada entidad define operaciones permitidas y motivo de restricción.

## Principio operativo
- Si una entidad no tiene regla explícita, se considera **no permitida offline**.
- Si la entidad permite offline, solo admite operaciones declaradas.

## Ejemplos base v1
- Permitidas offline:
  - `setting`: `create`, `update`, `upsert`
  - `feature_flag`: `create`, `update`, `upsert`
  - `financial_movement`: `create`, `update`
  - `financial_transfer`: `create`
- No permitidas offline:
  - `organization`, `branch`, `user`, `role`, `permission`, `user_role`, `role_permission`, `financial_account`

## Fuente técnica
- `packages/sync-contracts/src/offlineRules.js`
