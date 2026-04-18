# T-1213 - Crear modelo ReconciliationItem

## Metadatos
- ID: `T-1213`
- Fase: `Fase 12`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `DesktopAgent`

## Objetivo
Crear el modelo Prisma `ReconciliationItem` que representa un movimiento individual dentro de una sesión de conciliación. Cada ítem vincula un `FinancialMovement` a una `ReconciliationSession` y registra si fue conciliado, si hay discrepancia y cómo se resolvió.

## Alcance
- Crear modelo `ReconciliationItem` con campos: id, sessionId, financialMovementId, status (enum: PENDING, MATCHED, DISCREPANCY, RESOLVED), expectedAmount (Decimal, nullable), actualAmount (Decimal, nullable), discrepancyNotes (nullable), resolvedById (nullable), resolvedAt (nullable), createdAt, updatedAt.
- Relaciones: `ReconciliationSession`, `FinancialMovement`, `User` (resolvedBy, nullable).
- Definir índices: por `sessionId`, por `financialMovementId`.
- Ejecutar `prisma generate`, `typecheck` y `lint`.

## Fuera de alcance
- No incluye migración SQL (eso es `T-1219`).
- No incluye seeds (eso es `T-1220`).
- No incluye DTOs ni endpoints (eso es Fase 13).
- No implementa lógica de conciliación automática (fuera de alcance v1).

## Dependencias
- `T-1212` (`ReconciliationSession`): la FK `sessionId` requiere que `ReconciliationSession` exista en el schema.
- `T-1209` (`FinancialMovement`): la FK `financialMovementId` requiere que `FinancialMovement` exista.

## Criterios de aceptación
- [x] Modelo `ReconciliationItem` creado en Prisma.
- [x] Relación con `ReconciliationSession` y `FinancialMovement` definida.
- [x] Campos de discrepancia y resolución incluidos (nullable).
- [x] Enum `ReconciliationItemStatus` definido.
- [x] `prisma generate`, `typecheck` y `lint` en verde.

## Validaciones
- Verificar que los campos de discrepancia (`expectedAmount`, `actualAmount`, `discrepancyNotes`) son todos nullable (no todos los ítems tienen discrepancia).
- Confirmar que `resolvedById` y `resolvedAt` son nullable (un ítem puede estar PENDING sin resolución).
- Revisar que el enum `ReconciliationItemStatus` cubre los estados del ciclo de vida de conciliación.

## Pruebas
- `pnpm prisma validate` — sin errores de schema.
- `pnpm prisma generate` — cliente Prisma generado con `ReconciliationItem` y enum `ReconciliationItemStatus`.
- `pnpm typecheck` — sin errores TypeScript.

## Riesgos
- **Movimiento en múltiples sesiones**: un `FinancialMovement` podría aparecer en dos sesiones de conciliación simultáneas. Mitigación: la lógica de negocio debe validar que un movimiento no esté ya conciliado antes de añadirlo a una nueva sesión.
- **Discrepancia sin resolución**: un ítem en estado DISCREPANCY sin `resolvedAt` es un estado incoherente. Mitigación: validar en el servicio que el cierre de sesión requiere que todos los ítems estén en MATCHED o RESOLVED.

## Documentación a actualizar
- `apps/api/prisma/schema.prisma` — añadir modelo `ReconciliationItem` y enum `ReconciliationItemStatus`.

## Decisiones clave
- **`expectedAmount` y `actualAmount` separados**: permiten registrar la discrepancia exacta entre lo que el banco reporta y lo que el sistema tiene registrado, sin modificar el movimiento original.
- **Estado RESOLVED separado de MATCHED**: MATCHED significa conciliado sin discrepancia; RESOLVED significa que había discrepancia pero fue manualmente resuelta y documentada.

## Evidencia documental
- `apps/api/prisma/schema.prisma` — modelo `ReconciliationItem`, enum `ReconciliationItemStatus`.

## Pendientes para la siguiente task
- `T-1214` crea `BalanceSnapshot` para los cortes de saldo periódicos.

## Pendientes no resueltos
- Ninguno.
