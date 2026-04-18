# T-1307 - Crear DTOs de BankAccount

## Metadatos
- ID: `T-1307`
- Fase: `Fase 13`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Definir los DTOs de escritura para operaciones de cuenta bancaria en el módulo `BankAccounts`. Estos DTOs son el contrato de entrada de los endpoints CRUD que se exponen en T-1320.

## Alcance
- Crear DTOs:
  - `CreateBankAccountDto`: nombre, tipo de cuenta, moneda, número de cuenta (opcional), saldo inicial, sucursal, organización.
  - `UpdateBankAccountDto`: versión parcial de `CreateBankAccountDto` con todos los campos opcionales.
- Validaciones de formato con `class-validator`:
  - Moneda: código ISO 4217 (3 caracteres).
  - Saldo: número decimal positivo.
  - Nombre: longitud mínima 2, máxima 120.
  - Tipo: enum `BankAccountType`.

## Fuera de alcance
- DTOs de consulta/filtrado (`ListBankAccountsQueryDto` ya fue creado en T-1300).
- Validación de existencia de FK en base de datos (eso es responsabilidad del servicio).
- DTOs de respuesta/serialización (se devuelve la entidad Prisma directamente en v1).

## Dependencias
- `T-1300`: módulo `BankAccounts` creado — los DTOs se ubican en `dto/` dentro del módulo.
- `T-1215` a `T-1218` (Fase 12): enums `BankAccountType` disponibles en el cliente Prisma.

## Criterios de aceptación
- [x] DTOs de creación y actualización agregados.
- [x] Validaciones con `class-validator` incluidas.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- Prueba de validación manual: enviar `POST /api/v1/bank-accounts` con payload inválido (sin `name`) — debe retornar 400.
- Prueba de validación manual: enviar con `currencyCode: "USDX"` (longitud > 3) — debe retornar 400.
- Prueba de creación exitosa: payload completo y válido — debe retornar 201.

## Riesgos
- **UpdateBankAccountDto sin `PartialType`**: si se define manualmente en lugar de usar `PartialType(CreateBankAccountDto)`, las validaciones pueden divergir. Mitigación: usar `@nestjs/mapped-types` `PartialType`.
- **Enum de Prisma en DTO**: los valores del enum `BankAccountType` deben importarse desde el cliente Prisma generado, no redefinirse. Mitigación: importar desde `@prisma/client`.

## Documentación a actualizar
- `apps/api/src/modules/bank-accounts/dto/create-bank-account.dto.ts` — archivo nuevo.
- `apps/api/src/modules/bank-accounts/dto/update-bank-account.dto.ts` — archivo nuevo.

## Decisiones clave
- **`UpdateBankAccountDto` como `PartialType`**: todos los campos del update son opcionales porque el PATCH permite actualización parcial. Esto reduce duplicación de validaciones y facilita el mantenimiento.
- **Sin DTO de respuesta en v1**: el servicio devuelve la entidad Prisma directamente. La serialización/transformación de respuesta se aborda en Fase 14 cuando la UI tenga contratos definidos.

## Evidencia documental
- `apps/api/src/modules/bank-accounts/dto/create-bank-account.dto.ts`
- `apps/api/src/modules/bank-accounts/dto/update-bank-account.dto.ts`

## Pendientes para la siguiente task
- `T-1308` define los DTOs de escritura para `FinancialMovement`.

## Pendientes no resueltos
- Ninguno.
