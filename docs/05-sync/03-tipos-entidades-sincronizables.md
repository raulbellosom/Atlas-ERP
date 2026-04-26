# Tipos de Entidades Sincronizables

## ID de definición
- Task origen: `T-1001`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Catálogo oficial v1
- `organization`
- `branch`
- `user`
- `role`
- `permission`
- `user_role`
- `role_permission`
- `setting`
- `feature_flag`
- `attachment`
- `device_registry`
- `financial_account`
- `financial_movement`
- `financial_transfer`

## Reglas
- Solo estas entidades pueden viajar en `batch.items[].entity` para baseline v1.
- Nuevas entidades requieren actualización de contrato y versionado de payload.
- Entidades sensibles conservan validación de negocio en backend.

## Fuente técnica
- `packages/sync-contracts/src/entities.js`
