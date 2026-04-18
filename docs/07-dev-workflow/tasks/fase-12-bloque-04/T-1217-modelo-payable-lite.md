# T-1217 - Crear modelo PayableLite

## Metadatos
- ID: `T-1217`
- Fase: `Fase 12`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Crear el modelo Prisma `PayableLite` para registrar cuentas por pagar de forma simplificada. Simétrico a `ReceivableLite` pero orientado a compromisos de pago hacia terceros (proveedores). Permite controlar vencimientos, montos pendientes y el estado del ciclo de pago.

## Alcance
- Crear modelo `PayableLite` con campos: id, organizationId, branchId, counterpartyId, bankAccountId (nullable — cuenta desde donde se paga), amount (Decimal), paidAmount (Decimal, default 0), currencyCode, status (enum), issuedAt, dueAt, paidAt (nullable), reference (nullable), notes (nullable), createdById, createdAt, updatedAt, deletedAt.
- Enum `PayableStatus`: PENDING, PARTIAL, PAID, OVERDUE, CANCELLED.
- Relaciones: `Organization`, `Branch`, `CounterpartyLite`, `BankAccount` (nullable), `User` (createdBy).
- Definir índices: por `organizationId`, por `organizationId + status`, por `organizationId + dueAt`.
- Ejecutar `prisma generate`, `typecheck` y `lint`.

## Fuera de alcance
- No incluye contabilización ni asientos contables.
- No incluye integración con facturación electrónica ni CFDI.
- No incluye migración SQL (eso es `T-1219`).
- No incluye seeds (eso es `T-1220`).
- No incluye DTOs ni endpoints (eso es Fase 13).

## Dependencias
- `T-1215` (`CounterpartyLite`): la FK `counterpartyId` requiere que `CounterpartyLite` exista.
- `T-1207` (`BankAccount`): la FK `bankAccountId` (nullable) referencia la cuenta de pago.
- `T-1216` (`ReceivableLite`): el patrón de diseño es el mismo; debe ejecutarse antes para reutilizar la misma lógica de enum.

## Criterios de aceptación
- [x] Modelo `PayableLite` creado en `schema.prisma`.
- [x] Relaciones con tercero y cuenta bancaria definidas.
- [x] Índices por organización, estatus y vencimiento definidos.
- [x] `prisma generate`, `typecheck` y `lint` en verde.

## Validaciones
- Verificar que `paidAmount` tiene `@default(0)`.
- Confirmar que `bankAccountId` es nullable.
- Revisar que `amount` y `paidAmount` usan `Decimal`.
- Confirmar que `deletedAt` es nullable (soft-delete).

## Pruebas
- `pnpm prisma validate` — sin errores.
- `pnpm prisma generate` — cliente generado con `PayableLite` y `PayableStatus`.
- `pnpm typecheck` — sin errores TypeScript.

## Riesgos
- **Estado OVERDUE no automático**: igual que `ReceivableLite`, OVERDUE requiere evaluación en tiempo de consulta o scheduler. Mitigación: documentar en el servicio de Fase 13 cómo se evalúa el estado de vencimiento.
- **Duplicación de lógica con ReceivableLite**: ambos modelos son casi idénticos. Mitigación: es intencional — representan conceptos de negocio distintos aunque similares en estructura. No se combinan para mantener la semántica clara.

## Documentación a actualizar
- `apps/api/prisma/schema.prisma` — añadir modelo `PayableLite` y enum `PayableStatus`.

## Decisiones clave
- **Estructura simétrica con ReceivableLite**: mismos campos, mismo patrón de índices, mismo ciclo de vida. La simetría facilita el desarrollo de servicios y DTOs en Fase 13.
- **Modelos separados en lugar de un único modelo con dirección**: se mantienen separados porque la semántica de negocio es distinta (cobrar vs. pagar) aunque la estructura sea similar.

## Evidencia documental
- `apps/api/prisma/schema.prisma` — modelo `PayableLite`, enum `PayableStatus`.

## Pendientes para la siguiente task
- `T-1218` consolida y formaliza todos los enums del módulo, asegurando consistencia de mapeo en el schema.

## Pendientes no resueltos
- Ninguno.
