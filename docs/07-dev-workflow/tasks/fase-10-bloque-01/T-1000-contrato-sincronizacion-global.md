# T-1000 - Definir contrato de sincronización global

## Metadatos
- ID: `T-1000`
- Fase: `Fase 10`
- Bloque: `Bloque 1`
- Estado: `CERRADA`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `SyncCoreAgent`

## Alcance
Definir el contrato global de sincronización entre cliente y servidor, con estructura base de batch y reglas mínimas de validación.

## Implementación
- Se documentó el contrato oficial en `docs/05-sync/02-contrato-global-sync.md`.
- Se creó baseline técnico exportable en `packages/sync-contracts/src/index.js`.
- Se estableció estructura obligatoria: `version`, `requestId`, `sentAt`, `client`, `batch.totalItems` y `batch.items`.

## Criterios de aceptación
- [x] Existe contrato global formal documentado.
- [x] Contrato base exportable desde paquete compartido.
- [x] Contrato trazable a una task de Fase 10.

## Evidencia
- `docs/05-sync/02-contrato-global-sync.md`
- `packages/sync-contracts/src/index.js`
