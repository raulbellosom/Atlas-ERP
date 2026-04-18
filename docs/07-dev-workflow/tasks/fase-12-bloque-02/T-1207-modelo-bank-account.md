# T-1207 - Crear modelo BankAccount

## Metadatos
- ID: `T-1207`
- Fase: `Fase 12`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Objetivo
Crear el modelo Prisma `BankAccount` en `apps/api/prisma/schema.prisma` con todos los campos operativos de v1, las relaciones de integridad referencial y los índices de consulta base. Es la primera entidad de dominio del módulo en ser implementada en código.

## Alcance
- Definir el modelo `BankAccount` con campos operativos: id, organizationId, branchId, name, bankName, accountNumber, currency (ISO 4217), accountTypeId, initialBalance, currentBalance, isActive, description, createdById, createdAt, updatedAt, deletedAt.
- Establecer relaciones con: `Organization`, `Branch`, `User` (createdBy), `BankAccountType`.
- Declarar backrelation hacia `FinancialMovement` (la FK está en FinancialMovement).
- Definir índices de consulta: por `organizationId`, por `organizationId + isActive`, por `accountNumber`.
- Aplicar soft-delete mediante campo `deletedAt` (nullable, DateTime?).
- Ejecutar `prisma generate` para validar el modelo generado.

## Fuera de alcance
- No incluye la migración SQL (eso es `T-1219`).
- No incluye seeds de datos demo (eso es `T-1220`).
- No incluye DTOs ni endpoints de la API (eso es Fase 13).
- No incluye el modelo `BankAccountType` (eso es `T-1208`).

## Dependencias
- `T-1203` (catálogo de entidades): `BankAccount` es una entidad principal declarada.
- `T-1204` (relaciones Core Platform): las FK a `Organization`, `Branch` y `User` siguen el blueprint.
- `T-1208` debe ejecutarse en la misma sesión o inmediatamente después para que la relación `accountTypeId` tenga referencia válida en Prisma.
- Los modelos `Organization`, `Branch` y `User` existen en el schema de Core Platform (ya migrados).

## Criterios de aceptación
- [x] Modelo `BankAccount` creado con campos operativos base de v1.
- [x] Índices de consulta principales definidos.
- [x] Relaciones de integridad referencial definidas con `Organization`, `Branch`, `User` y `BankAccountType`.
- [x] Backrelation hacia `FinancialMovement` declarada.
- [x] `prisma generate` y `typecheck` en verde.

## Validaciones
- Verificar que el modelo usa PascalCase y los campos camelCase (convención Prisma).
- Confirmar que `deletedAt` es `DateTime?` (nullable).
- Revisar que `currency` es `String` de 3 caracteres (sin enum — se validará en DTO).
- Confirmar que los índices `@@index` cubren los patrones de consulta más frecuentes.

## Pruebas
- `pnpm prisma validate` — sin errores de schema.
- `pnpm prisma generate` — cliente Prisma generado correctamente.
- `pnpm typecheck` en `apps/api` — tipos de Prisma client sin errores TypeScript.

## Riesgos
- **`currentBalance` desnormalizado**: campo calculado que puede desincronizarse si no se actualiza en transacción. Mitigación: el servicio de movimientos debe actualizar `currentBalance` siempre en la misma transacción que crea/modifica el movimiento.
- **Conflicto con modelos de Core Platform**: si `Organization` o `User` cambian de nombre en el schema, este modelo falla. Mitigación: usar los nombres exactos del schema de Core Platform como fuente de verdad.

## Documentación a actualizar
- `apps/api/prisma/schema.prisma` — añadir modelo `BankAccount`.

## Decisiones clave
- **Soft-delete obligatorio**: `deletedAt` nullable en lugar de eliminación física, siguiendo la política de datos del canon.
- **`currentBalance` desnormalizado**: se mantiene en el modelo para lecturas de saldo sin agregación costosa, aceptando la complejidad transaccional en escrituras.

## Evidencia documental
- `apps/api/prisma/schema.prisma` — modelo `BankAccount`.

## Pendientes para la siguiente task
- `T-1208` debe crear `BankAccountType` para completar la relación `accountTypeId` de `BankAccount`.

## Pendientes no resueltos
- Ninguno.
