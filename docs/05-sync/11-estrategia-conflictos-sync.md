# Estrategia de Conflictos de Sync

## ID de definición
- Task origen: `T-1009`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Política oficial
Los conflictos se clasifican explícitamente y, por defecto, se resuelven con revisión manual salvo casos seguros.

## Tipos base de conflicto
- `version_mismatch`
- `simultaneous_update`
- `delete_vs_update`
- `invariant_violation`

## Reglas base
- Resolución por defecto: `manual_review`.
- Entidades sensibles siempre requieren revisión manual:
  - `financial_account`
  - `financial_movement`
  - `financial_transfer`
  - `attachment`
- Resoluciones permitidas:
  - `keep_local`
  - `keep_server`
  - `manual_merge`
  - `discard_local`

## Fuente técnica
- `packages/sync-contracts/src/conflicts.js`
