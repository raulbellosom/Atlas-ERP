# T-1212 - Crear modelo ReconciliationSession

## Metadatos
- ID: `T-1212`
- Fase: `Fase 12`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `DesktopAgent`

## Objetivo
Crear el modelo Prisma `ReconciliationSession` que representa una sesión de conciliación bancaria manual. Una sesión agrupa los ítems de conciliación (`ReconciliationItem`) para una cuenta bancaria en un período determinado, permitiendo al usuario abrir, trabajar y cerrar el proceso de conciliación de forma ordenada.

## Alcance
- Crear modelo `ReconciliationSession` con campos: id, organizationId, bankAccountId, branchId, status (enum: OPEN, IN_PROGRESS, CLOSED, VOIDED), periodStart (DateTime), periodEnd (DateTime), openedById, closedById (nullable), closedAt (nullable), notes (nullable), createdAt, updatedAt.
- Relaciones: `Organization`, `BankAccount`, `Branch`, `User` (openedBy, closedBy — dos relaciones nombradas), `ReconciliationItem` (backrelation uno-a-muchos).
- Definir índices: por `organizationId`, por `bankAccountId + status`.
- Ejecutar `prisma generate`, `typecheck` y `lint`.

## Fuera de alcance
- No incluye migración SQL (eso es `T-1219`).
- No incluye seeds (eso es `T-1220`).
- No incluye DTOs ni endpoints (eso es Fase 13).
- No incluye integración bancaria automática (fuera de alcance v1).

## Dependencias
- `T-1207` (`BankAccount`): la FK `bankAccountId` requiere que `BankAccount` exista.
- `T-1213` (`ReconciliationItem`): la backrelation de sesión a ítems requiere que `ReconciliationItem` sea creado en la misma sesión de trabajo o inmediatamente después.

## Criterios de aceptación
- [x] Modelo `ReconciliationSession` creado.
- [x] Relaciones con `BankAccount`, `Organization`, `Branch` y `User` (openedBy, closedBy) definidas.
- [x] Relación uno-a-muchos con `ReconciliationItem` declarada como backrelation.
- [x] Enum de estado `ReconciliationSessionStatus` definido.
- [x] `prisma generate`, `typecheck` y `lint` en verde.

## Validaciones
- Verificar que las dos FK hacia `User` (openedBy, closedBy) usan nombres de relación explícitos.
- Confirmar que `closedById` y `closedAt` son nullable (la sesión puede estar abierta).
- Revisar que el enum `ReconciliationSessionStatus` tiene los valores correctos.

## Pruebas
- `pnpm prisma validate` — sin errores de schema.
- `pnpm prisma generate` — cliente Prisma generado con `ReconciliationSession`.
- `pnpm typecheck` — sin errores TypeScript.

## Riesgos
- **Estado inconsistente**: una sesión marcada como CLOSED sin que todos sus ítems estén resueltos. Mitigación: la lógica de cierre en el servicio debe validar el estado de los ítems antes de cerrar la sesión.
- **Relaciones ambiguas a User**: igual que en `Transfer`, dos FK al mismo modelo requieren nombres de relación explícitos.

## Documentación a actualizar
- `apps/api/prisma/schema.prisma` — añadir modelo `ReconciliationSession` y enum `ReconciliationSessionStatus`.

## Decisiones clave
- **Período explícito (periodStart/periodEnd)**: la sesión de conciliación cubre un rango de fechas para filtrar movimientos relevantes, no todos los movimientos históricos de la cuenta.
- **Estado VOIDED**: permite anular una sesión sin eliminarla, manteniendo el historial para auditoría.

## Evidencia documental
- `apps/api/prisma/schema.prisma` — modelo `ReconciliationSession`, enum `ReconciliationSessionStatus`.

## Pendientes para la siguiente task
- `T-1213` crea `ReconciliationItem` para los ítems individuales dentro de cada sesión.

## Pendientes no resueltos
- Ninguno.
