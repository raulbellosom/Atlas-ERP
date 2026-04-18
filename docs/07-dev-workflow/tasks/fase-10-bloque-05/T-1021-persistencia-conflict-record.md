# T-1021 - Implementar persistencia backend de ConflictRecord

## Metadatos
- ID: `T-1021`
- Fase: `Fase 10`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAgent`

## Alcance
`sync.service.ts` — detección y persistencia de conflictos en `processSingleItem()`:

- Cuando se detecta un item previo APLICADO con **diferente payload** (via `comparePayloads`):
  1. Crea `SyncItem` con `status=CONFLICT_DETECTED`.
  2. Crea `ConflictRecord` con `localPayload` (lo que vino del desktop) y `serverPayload` (lo que había en BD), `status=OPEN`.
  3. Si la entidad es de auto-resolución segura → llama `autoResolveConflict()`.
  4. Si no → retorna `{ status: 'conflict', conflictId }` para que el cliente lo presente al usuario.

## Criterios de aceptacion
- [x] ConflictRecord creado para conflictos reales (payloads distintos).
- [x] No se crea ConflictRecord para items idempotentes (mismo payload).
- [x] typecheck + lint OK.
