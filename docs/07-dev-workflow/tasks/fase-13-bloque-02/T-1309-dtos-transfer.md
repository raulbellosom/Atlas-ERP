# T-1309 - Crear DTOs de Transfer

## Metadatos
- ID: `T-1309`
- Fase: `Fase 13`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Definir los DTOs de escritura para operaciones de transferencia entre cuentas bancarias en el módulo `Transfers`. Estos DTOs son el contrato de entrada de los endpoints CRUD que se exponen en T-1322.

## Alcance
- Crear DTOs:
  - `CreateTransferDto`: cuenta origen, cuenta destino, monto, moneda, fecha de transferencia, referencia, notas, organización.
  - `UpdateTransferDto`: versión parcial con todos los campos opcionales.
- Validaciones con `class-validator`:
  - Cuentas origen/destino: UUIDs válidos.
  - Monto: decimal positivo.
  - Moneda: código ISO 4217.
  - Fecha: cadena ISO 8601.
  - Estatus: enum `TransferStatus`.

## Fuera de alcance
- DTO de filtrado (`ListTransfersQueryDto` ya creado en T-1302).
- Validación de que cuenta origen ≠ cuenta destino (lógica del servicio).
- Validación de saldo suficiente en cuenta origen (lógica de negocio Fase 14+).

## Dependencias
- `T-1302`: módulo `Transfers` creado.
- `T-1215` a `T-1218` (Fase 12): enum `TransferStatus` disponible en cliente Prisma.

## Criterios de aceptación
- [x] DTOs de creación y actualización agregados.
- [x] Validaciones con `class-validator` incluidas (enums, fechas, campos monetarios).
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- Enviar `POST /api/v1/transfers` sin `fromAccountId` — debe retornar 400.
- Enviar con `fromAccountId` que no es UUID — debe retornar 400.
- Enviar con `amount: 0` — debe retornar 400.
- Enviar payload válido — debe retornar 201.

## Riesgos
- **Validación cuenta origen ≠ destino en DTO vs. servicio**: la validación de que `fromAccountId !== toAccountId` podría hacerse en el DTO con un validador personalizado, pero introduce acoplamiento. Mitigación: dejar la validación en el servicio (lanza `BadRequestException`).

## Documentación a actualizar
- `apps/api/src/modules/transfers/dto/create-transfer.dto.ts` — archivo nuevo.
- `apps/api/src/modules/transfers/dto/update-transfer.dto.ts` — archivo nuevo.

## Decisiones clave
- **Transferencia como operación atómica**: el servicio crea la `Transfer` y los dos `FinancialMovement` (TRANSFER_OUT y TRANSFER_IN) en una transacción Prisma. El DTO solo captura los datos de la transferencia, no los movimientos individuales.
- **Moneda en el DTO de transferencia**: aunque ambas cuentas deberían tener la misma moneda en v1, el DTO permite especificarla explícitamente para casos de transferencia entre monedas en versiones futuras.

## Evidencia documental
- `apps/api/src/modules/transfers/dto/create-transfer.dto.ts`
- `apps/api/src/modules/transfers/dto/update-transfer.dto.ts`

## Pendientes para la siguiente task
- `T-1310` (Bloque 3) define los DTOs de `Reconciliation`.

## Pendientes no resueltos
- Ninguno.
