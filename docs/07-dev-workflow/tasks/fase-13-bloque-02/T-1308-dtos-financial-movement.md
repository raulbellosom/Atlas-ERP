# T-1308 - Crear DTOs de FinancialMovement

## Metadatos
- ID: `T-1308`
- Fase: `Fase 13`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Definir los DTOs de escritura para operaciones de movimiento financiero en el módulo `FinancialMovements`. Estos DTOs son el contrato de entrada de los endpoints CRUD que se exponen en T-1321.

## Alcance
- Crear DTOs:
  - `CreateFinancialMovementDto`: cuenta bancaria, tipo de movimiento, monto, moneda, fecha de movimiento, referencia, notas, sucursal, organización, creado por.
  - `UpdateFinancialMovementDto`: versión parcial con todos los campos opcionales.
- Validaciones con `class-validator`:
  - Tipo: enum `FinancialMovementType`.
  - Estatus: enum `FinancialMovementStatus`.
  - Monto: decimal positivo.
  - Fecha: cadena ISO 8601 convertible a `Date`.

## Fuera de alcance
- DTO de filtrado (`ListFinancialMovementsQueryDto` ya creado en T-1301).
- DTO de upload de comprobantes (`UploadMovementAttachmentDto` se crea en T-1330).
- Validación de saldo suficiente (lógica del servicio, no del DTO).

## Dependencias
- `T-1301`: módulo `FinancialMovements` creado.
- `T-1215` a `T-1218` (Fase 12): enums `FinancialMovementType` y `FinancialMovementStatus` disponibles en cliente Prisma.

## Criterios de aceptación
- [x] DTOs de creación y actualización agregados.
- [x] Validaciones con `class-validator` incluidas (enums, fechas, campos monetarios).
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- Enviar `POST /api/v1/financial-movements` sin `movementType` — debe retornar 400.
- Enviar con `movementType: "INVALIDO"` — debe retornar 400.
- Enviar con `amount: -100` — debe retornar 400.
- Enviar payload válido — debe retornar 201.

## Riesgos
- **Conversión de fecha ISO a Date**: el campo `movementDate` llega como string ISO desde el cliente. Si no se aplica `@Type(() => Date)` de `class-transformer`, Prisma recibirá un string y fallará. Mitigación: usar `@IsDateString()` + transformador en el servicio.
- **Enum de tipo movimiento muy extenso**: `FinancialMovementType` incluye INCOME, EXPENSE, TRANSFER_IN, TRANSFER_OUT, etc. El DTO debe validar exactamente los valores del enum Prisma.

## Documentación a actualizar
- `apps/api/src/modules/financial-movements/dto/create-financial-movement.dto.ts` — archivo nuevo.
- `apps/api/src/modules/financial-movements/dto/update-financial-movement.dto.ts` — archivo nuevo.

## Decisiones clave
- **`@IsDateString()` sobre `@IsDate()`**: el DTO recibe strings ISO desde HTTP, no objetos Date. La conversión a `Date` se hace en el servicio antes de la llamada a Prisma.
- **Monto como `number` en DTO**: aunque Prisma usa `Decimal`, el DTO acepta `number` y el servicio convierte. Esto simplifica el cliente web que siempre envía números JSON.

## Evidencia documental
- `apps/api/src/modules/financial-movements/dto/create-financial-movement.dto.ts`
- `apps/api/src/modules/financial-movements/dto/update-financial-movement.dto.ts`

## Pendientes para la siguiente task
- `T-1309` define los DTOs de escritura para `Transfer`.

## Pendientes no resueltos
- Ninguno.
