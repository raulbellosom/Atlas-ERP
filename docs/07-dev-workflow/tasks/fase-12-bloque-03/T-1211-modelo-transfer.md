# T-1211 - Crear modelo Transfer

## Metadatos
- ID: `T-1211`
- Fase: `Fase 12`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `DesktopAgent`

## Objetivo
Crear el modelo Prisma `Transfer` que coordina transferencias de dinero entre dos cuentas bancarias de la misma organización. Una transferencia genera dos `FinancialMovement` (TRANSFER_OUT + TRANSFER_IN) de forma atómica y los vincula a través de este modelo.

## Alcance
- Crear modelo `Transfer` con campos: id, organizationId, fromBankAccountId, toBankAccountId, amount (Decimal), currencyCode, status, occurredAt, description, reference, outMovementId (nullable), inMovementId (nullable), createdById, createdAt, updatedAt.
- Relaciones: `Organization`, `BankAccount` (dos relaciones nombradas: from y to), `FinancialMovement` (outMovement, inMovement, opcionales), `User` (createdBy).
- Definir índices: por `organizationId`, por `fromBankAccountId`, por `toBankAccountId`.
- Ejecutar `prisma generate`, `typecheck` y `lint`.

## Fuera de alcance
- No incluye migración SQL (eso es `T-1219`).
- No incluye seeds (eso es `T-1220`).
- No incluye DTOs ni endpoints (eso es Fase 13).
- No incluye transferencias entre organizaciones distintas (fuera de alcance v1).

## Dependencias
- `T-1207` (`BankAccount`): las FK `fromBankAccountId` y `toBankAccountId` requieren `BankAccount` en el schema.
- `T-1209` (`FinancialMovement`): las FK opcionales `outMovementId` e `inMovementId` referencian `FinancialMovement`.

## Criterios de aceptación
- [x] Modelo `Transfer` creado en Prisma.
- [x] Relaciones `fromBankAccount` y `toBankAccount` con nombres de relación explícitos (`@relation(name: ...)`).
- [x] Relaciones opcionales con movimientos de salida/entrada definidas.
- [x] Índices básicos definidos.
- [x] `prisma generate`, `typecheck` y `lint` en verde.

## Validaciones
- Verificar que las dos FK hacia `BankAccount` usan `@relation(name: ...)` para evitar error de "ambiguous relation" en Prisma.
- Confirmar que `outMovementId` e `inMovementId` son `String?` (nullable).
- Revisar que `amount` usa `Decimal` (no `Float`).

## Pruebas
- `pnpm prisma validate` — especial atención a las relaciones ambiguas de `BankAccount`.
- `pnpm prisma generate` — cliente Prisma generado con `Transfer`.
- `pnpm typecheck` — sin errores TypeScript en `apps/api`.

## Riesgos
- **Relaciones ambiguas a BankAccount**: Prisma falla sin `@relation(name: ...)` cuando hay dos FK al mismo modelo. Mitigación: nombrar explícitamente ambas relaciones.
- **Inconsistencia de estado**: una `Transfer` completada con movimientos pendientes crea estado incoherente. Mitigación: la lógica de negocio debe crear movimientos y actualizar estado en una sola transacción de base de datos.

## Documentación a actualizar
- `apps/api/prisma/schema.prisma` — añadir modelo `Transfer`.

## Decisiones clave
- **Transfer como coordinador de movimientos**: la transferencia no mueve dinero directamente; crea dos `FinancialMovement` (TRANSFER_OUT + TRANSFER_IN) en transacción atómica. Permite conciliar ambos lados por separado y mantiene el libro de movimientos completo.
- **Movimientos opcionales en el schema**: declarados como nullable para permitir la creación del registro `Transfer` antes de los movimientos, aunque en la práctica siempre se crean en la misma transacción.

## Evidencia documental
- `apps/api/prisma/schema.prisma` — modelo `Transfer`.

## Pendientes para la siguiente task
- `T-1212` crea `ReconciliationSession` para el módulo de conciliación básica.

## Pendientes no resueltos
- Ninguno.
