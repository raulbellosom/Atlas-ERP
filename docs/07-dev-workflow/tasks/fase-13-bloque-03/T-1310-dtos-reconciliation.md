# T-1310 - Crear DTOs de Reconciliation

## Metadatos
- ID: `T-1310`
- Fase: `Fase 13`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Definir los DTOs de escritura para sesiones e ítems de conciliación en el módulo `Reconciliation`. Estos DTOs son el contrato de entrada de los endpoints CRUD de T-1316 y los endpoints operativos de T-1328 y T-1329.

## Alcance
- Crear DTOs para sesiones:
  - `CreateReconciliationSessionDto`: cuenta bancaria, nombre de sesión, periodo de inicio/fin, tipo de sesión.
  - `UpdateReconciliationSessionDto`: versión parcial con todos los campos opcionales.
- Crear DTOs para ítems:
  - `CreateReconciliationItemDto`: sesión, movimiento referenciado (opcional), monto esperado, monto actual, descripción.
  - `UpdateReconciliationItemDto`: versión parcial con todos los campos opcionales.
- Validaciones con `class-validator`:
  - Enums `ReconciliationSessionStatus`, `ReconciliationItemStatus`.
  - Fechas de periodo: cadenas ISO 8601.
  - Montos: decimales positivos.

## Fuera de alcance
- DTOs operativos (`ReconcileSessionDto`, `CloseReconciliationSessionDto`) — se crean en T-1328 y T-1329.
- DTOs de filtrado (`ListReconciliationSessionsQueryDto`, `ListReconciliationItemsQueryDto`) — creados en T-1303.

## Dependencias
- `T-1303`: módulo `Reconciliation` creado.
- `T-1215` a `T-1218` (Fase 12): enums `ReconciliationSessionStatus` y `ReconciliationItemStatus` disponibles en cliente Prisma.

## Criterios de aceptación
- [x] DTOs de conciliación creados (sesión + ítem, create + update).
- [x] Validaciones de entrada definidas.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- Enviar `POST /api/v1/reconciliation/sessions` sin `bankAccountId` — debe retornar 400.
- Enviar con `periodStart` que no es fecha válida — debe retornar 400.
- Enviar payload válido — debe retornar 201.

## Riesgos
- **DTO de ítem referencia sesión por ID**: si la sesión no existe, el servicio debe lanzar `NotFoundException`. El DTO solo valida que `sessionId` sea un UUID, no que exista.
- **Montos esperado vs. actual**: ambos campos en `CreateReconciliationItemDto` deben ser decimales, pero el monto actual puede estar ausente al momento de creación (se registra al reconciliar). Mitigación: `actualAmount` es opcional en el DTO de creación.

## Documentación a actualizar
- `apps/api/src/modules/reconciliation/dto/create-reconciliation-session.dto.ts` — archivo nuevo.
- `apps/api/src/modules/reconciliation/dto/update-reconciliation-session.dto.ts` — archivo nuevo.
- `apps/api/src/modules/reconciliation/dto/create-reconciliation-item.dto.ts` — archivo nuevo.
- `apps/api/src/modules/reconciliation/dto/update-reconciliation-item.dto.ts` — archivo nuevo.

## Decisiones clave
- **Sesión e ítem como DTOs separados**: aunque están en el mismo módulo, los DTOs se separan por entidad para facilitar la validación independiente en sus respectivos endpoints.
- **`actualAmount` opcional en creación**: al crear un ítem de conciliación, el monto real puede no estar disponible aún. Se registra al ejecutar la conciliación (T-1328).

## Evidencia documental
- `apps/api/src/modules/reconciliation/dto/create-reconciliation-session.dto.ts`
- `apps/api/src/modules/reconciliation/dto/update-reconciliation-session.dto.ts`
- `apps/api/src/modules/reconciliation/dto/create-reconciliation-item.dto.ts`
- `apps/api/src/modules/reconciliation/dto/update-reconciliation-item.dto.ts`

## Pendientes para la siguiente task
- `T-1311` define los DTOs de `ReceivablesLite`.

## Pendientes no resueltos
- Ninguno.
