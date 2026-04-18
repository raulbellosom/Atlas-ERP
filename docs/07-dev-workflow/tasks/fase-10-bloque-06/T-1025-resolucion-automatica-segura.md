# T-1025 - Implementar resolucion automatica solo donde sea seguro

## Metadatos
- ID: `T-1025`
- Fase: `Fase 10`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAgent`

## Alcance
`sync.service.ts` — formalizacion del sistema de estrategias de auto-resolucion:

- `AutoResolveStrategy` (tipo exportado): `'APPROVE_LOCAL' | 'KEEP_SERVER' | 'none'`
- `ENTITY_RESOLVE_STRATEGIES`: mapa entity → estrategia:
  - setting, feature_flag, device_registry → APPROVE_LOCAL
  - attachment, financial_movement, financial_transfer, financial_account → none
- `getAutoResolveStrategy(entity, operation)`: retorna 'none' siempre para operacion 'delete'; de lo contrario consulta el mapa
- `processSingleItem` actualizado: usa `getAutoResolveStrategy` en lugar de `SAFE_AUTO_RESOLVE_ENTITIES.has`

## Criterios de aceptacion
- [x] Operaciones 'delete' nunca se auto-resuelven independientemente de la entidad.
- [x] Entidades LWW (setting, feature_flag, device_registry) siguen resolviendo con APPROVE_LOCAL.
- [x] El mapa es extensible sin modificar la logica de procesamiento.
- [x] typecheck + lint OK.
