# T-1209 - Crear modelo FinancialMovement

## Metadatos
- ID: `T-1209`
- Fase: `Fase 12`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Objetivo
Crear el modelo Prisma `FinancialMovement` — la entidad central de registro de operaciones financieras. Soporta ingresos, egresos y ajustes manuales con trazabilidad completa por organización, cuenta y usuario.

## Alcance
- Crear modelo `FinancialMovement` con campos: id, organizationId, bankAccountId, branchId, movementType (enum), status (enum), amount (Decimal), currencyCode, occurredAt (DateTime), description, reference, createdById, confirmedById (nullable), postedAt (nullable), voidedAt (nullable), voidReason (nullable), createdAt, updatedAt, deletedAt.
- Definir enums `MovementType` (INCOME, EXPENSE, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT) y `MovementStatus` (PENDING, CONFIRMED, POSTED, VOIDED).
- Establecer relaciones con: `Organization`, `BankAccount`, `Branch`, `User` (createdBy, confirmedBy).
- Declarar backrelations hacia `FinancialMovementAttachment` y `ReconciliationItem`.
- Definir índices de consulta: por `organizationId`, por `bankAccountId + occurredAt`, por `organizationId + status`, por `organizationId + movementType`.

## Fuera de alcance
- No incluye la migración SQL (eso es `T-1219`).
- No incluye seeds (eso es `T-1220`).
- No incluye DTOs ni endpoints (eso es Fase 13).
- No incluye el modelo `Transfer` (eso es `T-1211`).
- No incluye el modelo `FinancialMovementAttachment` (eso es `T-1210`).

## Dependencias
- `T-1207` (`BankAccount`): la FK `bankAccountId` requiere que `BankAccount` ya exista en el schema.
- `T-1203` (catálogo de entidades): `FinancialMovement` es la entidad central del módulo.
- `T-1205` (Sync Core): los campos de trazabilidad de sync declarados en el blueprint se incluyen aquí.

## Criterios de aceptación
- [x] Modelo `FinancialMovement` creado con campos operativos de v1.
- [x] Enums `MovementType` y `MovementStatus` definidos en el schema.
- [x] Índices para consultas por organización/cuenta/fecha definidos.
- [x] Integridad relacional definida con `BankAccount` y `Organization`.
- [x] `prisma generate` y `typecheck` en verde.

## Validaciones
- Verificar que `amount` usa tipo `Decimal` de Prisma (no `Float`) para precisión financiera.
- Confirmar que `occurredAt` es distinto de `createdAt`: `occurredAt` es la fecha del evento de negocio, `createdAt` es la fecha de registro.
- Revisar que los enums `MovementType` y `MovementStatus` cubren todos los casos declarados en el alcance v1.
- Confirmar que `deletedAt` es nullable (soft-delete).

## Pruebas
- `pnpm prisma validate` — sin errores de schema.
- `pnpm prisma generate` — cliente Prisma generado con `FinancialMovement`, `MovementType` y `MovementStatus`.
- `pnpm typecheck` en `apps/api` — sin errores TypeScript.

## Riesgos
- **Uso de `Float` en lugar de `Decimal`**: errores de punto flotante en cálculos financieros. Mitigación: usar `Decimal` de Prisma siempre para campos monetarios.
- **Enum incompleto**: si los tipos o estados no cubren todos los casos de negocio, habrá migraciones adicionales. Mitigación: revisar el alcance v1 completo (`T-1201`) antes de cerrar el enum.

## Documentación a actualizar
- `apps/api/prisma/schema.prisma` — añadir modelo `FinancialMovement` y enums `MovementType`, `MovementStatus`.

## Decisiones clave
- **`Decimal` para `amount`**: decisión arquitectónica para evitar errores de punto flotante en operaciones financieras.
- **`occurredAt` separado de `createdAt`**: permite registrar movimientos con fecha retroactiva (e.g., conciliar un pago de días anteriores) sin alterar la trazabilidad de cuándo se ingresó al sistema.
- **Estados del ciclo de vida**: PENDING → CONFIRMED → POSTED → VOIDED sigue el flujo de aprobación financiera básica sin contabilidad formal.

## Evidencia documental
- `apps/api/prisma/schema.prisma` — modelos `FinancialMovement`, enums `MovementType` y `MovementStatus`.

## Pendientes para la siguiente task
- `T-1210` crea `FinancialMovementAttachment` como entidad puente entre `FinancialMovement` y `Attachment`.

## Pendientes no resueltos
- Ninguno.
