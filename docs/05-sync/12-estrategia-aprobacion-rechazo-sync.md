# Estrategia de Aprobación/Rechazo de Sync

## ID de definición
- Task origen: `T-1010`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Política oficial
La aceptación de cambios de sync se rige por riesgo:
- bajo riesgo: puede aprobarse automáticamente,
- alto riesgo o conflicto: requiere revisión.

## Decisiones de aprobación
- `approved`
- `rejected`
- `pending_review`

## Reglas base
- Entidades de alto riesgo pasan a `pending_review`.
- Si el item incluye conflicto clasificado, pasa a `pending_review`.
- Entidades de bajo riesgo pueden ir en `approved`.
- `rejected` cancela el item de cola para ejecución.

## Fuente técnica
- `packages/sync-contracts/src/approvals.js`
