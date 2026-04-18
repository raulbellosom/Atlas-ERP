# T-1216 - Crear modelo ReceivableLite

## Metadatos
- ID: `T-1216`
- Fase: `Fase 12`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Crear el modelo Prisma `ReceivableLite` para registrar cuentas por cobrar de forma simplificada. Permite registrar montos adeudados por terceros, fechas de vencimiento y cobro, y el estado del ciclo de vida de la cuenta, sin la complejidad de un módulo contable completo.

## Alcance
- Crear modelo `ReceivableLite` con campos: id, organizationId, branchId, counterpartyId, bankAccountId (nullable — cuenta donde se cobrará), amount (Decimal), paidAmount (Decimal, default 0), currencyCode, status (enum), issuedAt, dueAt, paidAt (nullable), reference (nullable), notes (nullable), createdById, createdAt, updatedAt, deletedAt.
- Enum `ReceivableStatus`: PENDING, PARTIAL, PAID, OVERDUE, CANCELLED.
- Relaciones: `Organization`, `Branch`, `CounterpartyLite`, `BankAccount` (nullable), `User` (createdBy).
- Definir índices: por `organizationId`, por `organizationId + status`, por `organizationId + dueAt`.
- Ejecutar `prisma generate`, `typecheck` y `lint`.

## Fuera de alcance
- No incluye contabilización por partida doble ni asientos contables.
- No incluye integración con facturación electrónica.
- No incluye migración SQL (eso es `T-1219`).
- No incluye seeds (eso es `T-1220`).
- No incluye DTOs ni endpoints (eso es Fase 13).

## Dependencias
- `T-1215` (`CounterpartyLite`): la FK `counterpartyId` requiere que `CounterpartyLite` exista.
- `T-1207` (`BankAccount`): la FK `bankAccountId` (nullable) referencia la cuenta de cobro.
- `T-1201` (alcance v1): receivables lite están declaradas en el alcance.

## Criterios de aceptación
- [x] Modelo `ReceivableLite` creado en `schema.prisma`.
- [x] Relaciones con tercero y cuenta bancaria definidas.
- [x] Índices por organización, estatus y vencimiento definidos.
- [x] `prisma generate`, `typecheck` y `lint` en verde.

## Validaciones
- Verificar que `paidAmount` tiene `@default(0)` para no requerir valor inicial.
- Confirmar que `bankAccountId` es nullable (un receivable puede existir sin cuenta de destino definida).
- Revisar que `amount` y `paidAmount` usan `Decimal`.
- Confirmar que `deletedAt` es nullable (soft-delete).

## Pruebas
- `pnpm prisma validate` — sin errores.
- `pnpm prisma generate` — cliente generado con `ReceivableLite` y `ReceivableStatus`.
- `pnpm typecheck` — sin errores TypeScript.

## Riesgos
- **Estado OVERDUE sin automatización**: el estado OVERDUE no se actualiza automáticamente cuando vence la fecha. Mitigación: declarar en el servicio que OVERDUE se calcula en tiempo de consulta o se actualiza via scheduler (Fase futura).
- **`paidAmount > amount`**: un cobro excesivo podría resultar en `paidAmount > amount` sin validación. Mitigación: el servicio debe validar que `paidAmount ≤ amount`.

## Documentación a actualizar
- `apps/api/prisma/schema.prisma` — añadir modelo `ReceivableLite` y enum `ReceivableStatus`.

## Decisiones clave
- **`paidAmount` separado de `amount`**: permite pagos parciales sin modificar el monto original, alineando con la semántica de "cuenta por cobrar parcialmente pagada".
- **`bankAccountId` nullable**: la cuenta de destino puede asignarse al momento del cobro, no al crear el receivable.

## Evidencia documental
- `apps/api/prisma/schema.prisma` — modelo `ReceivableLite`, enum `ReceivableStatus`.

## Pendientes para la siguiente task
- `T-1217` crea `PayableLite` con estructura simétrica a `ReceivableLite` pero para cuentas por pagar.

## Pendientes no resueltos
- Ninguno.
