# T-1333 - Integrar soporte de sync del módulo

## Metadatos
- ID: `T-1333`
- Fase: `Fase 13`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Habilitar las entidades financieras del módulo Financial Operations Core para el pipeline de sincronización backend (Sync Core), registrando su clasificación de riesgo y estrategia de resolución de conflictos.

## Alcance
- `SyncBatchItemDto` ampliado para aceptar los tipos de entidad del módulo:
  - `bank_account`
  - `financial_movement`
  - `financial_transfer`
  - `receivable`
  - `payable`
  - `reconciliation_session`
- Estrategias de resolución de conflicto actualizadas en `SyncService`:
  - Todas las entidades financieras quedan con estrategia `none` (sin auto-resolución).
- Clasificación de riesgo actualizada:
  - Todas las entidades financieras marcadas como `dangerous merge` en sync.
- Suite de pruebas extendida:
  - `sync-finops-support.test.ts` — valida el registro de entidades y estrategias.

## Fuera de alcance
- Implementación del pipeline de sincronización completo para entidades financieras (eso es Fase 15).
- Resolución de conflictos automática para entidades financieras (deliberadamente excluida por riesgo).

## Dependencias
- `SyncModule`: módulo de sincronización existente en el backend.
- `T-1334`: la suite de pruebas de sync se crea en esta task — la dependencia es co-task.

## Criterios de aceptación
- [x] El backend acepta entidades de sync requeridas por el módulo financiero.
- [x] Entidades financieras no se auto-resuelven por defecto en conflictos.
- [x] Entidades financieras quedan clasificadas como de riesgo para revisión.
- [x] `test:sync-core` ✅ · `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run test:sync-core`: 11/11 pruebas en verde.
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- Suite `sync-finops-support.test.ts` valida:
  - Que `bank_account`, `financial_movement`, etc. están en `ALLOWED_SYNC_ENTITIES`.
  - Que la estrategia de resolución es `none` para cada entidad financiera.
  - Que cada entidad financiera está clasificada como `dangerous_merge`.

## Riesgos
- **Entidades financieras con auto-resolución accidental**: si la configuración de `SyncService` aplica una estrategia por defecto para entidades no registradas, las entidades financieras nuevas podrían resolverse automáticamente. Mitigación: verificar que el fallback de estrategia es `none` para tipos desconocidos.
- **`financial_transfer` vs. `transfer`**: el tipo de entidad en sync debe ser consistente con el nombre usado en el cliente desktop. Mitigación: documentar el tipo exacto en la sección de alcance.

## Documentación a actualizar
- `apps/api/src/modules/sync/dto/sync-batch-item.dto.ts` — tipos de entidad financiera agregados.
- `apps/api/src/modules/sync/sync.service.ts` — estrategias y clasificación de riesgo actualizadas.
- `apps/api/src/modules/sync/sync-finops-support.test.ts` — archivo nuevo.

## Decisiones clave
- **Estrategia `none` para entidades financieras**: los datos financieros no deben auto-resolverse porque una resolución incorrecta puede generar inconsistencias contables. Cualquier conflicto financiero requiere revisión manual.
- **Clasificación `dangerous merge`**: esta clasificación alerta al operador de sync que estas entidades requieren cuidado especial, diferenciándolas de entidades de catálogo o configuración que sí pueden auto-mergearse.

## Evidencia documental
- `apps/api/src/modules/sync/dto/sync-batch-item.dto.ts`
- `apps/api/src/modules/sync/sync.service.ts`
- `apps/api/src/modules/sync/sync-finops-support.test.ts`

## Pendientes para la siguiente task
- `T-1334` documenta la suite unitaria de sync como task independiente.

## Pendientes no resueltos
- Ninguno.
