# T-1325 - Crear endpoint de balance por cuenta

## Metadatos
- ID: `T-1325`
- Fase: `Fase 13`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Exponer un endpoint dedicado para consultar el balance actual de una cuenta bancaria específica, retornando el saldo, moneda y metadatos de la cuenta.

## Alcance
- Endpoint agregado en `BankAccountsController`:
  - `GET /api/v1/bank-accounts/:id/balance`
- Método agregado en `BankAccountsService`:
  - `getBalanceByAccount(id: string)`: retorna `{ accountId, balance, currencyCode, accountName, isActive }`.
- Manejo de `NotFoundException` (404) cuando la cuenta no existe o está eliminada lógicamente.

## Fuera de alcance
- Cálculo de balance basado en suma de movimientos (eso es Fase 14 — en v1 se devuelve `balance` del campo almacenado en `BankAccount`).
- Endpoint de balance histórico (eso es `BalanceSnapshots`).
- Endpoint de resumen de saldos por organización (eso es T-1327).

## Dependencias
- `T-1320`: endpoints CRUD de `BankAccounts` ya expuestos.
- `T-1313`: `BankAccountsService` con métodos de consulta disponibles.

## Criterios de aceptación
- [x] Endpoint de balance por cuenta disponible.
- [x] Respuesta incluye balance, moneda y metadatos base de la cuenta.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `GET /api/v1/bank-accounts/:id/balance` con id existente → 200 con `{ balance, currencyCode, accountName }`.
- `GET /api/v1/bank-accounts/:id/balance` con id inexistente → 404.
- `GET /api/v1/bank-accounts/:id/balance` con cuenta soft-deleted → 404.

## Riesgos
- **Ruta `/:id/balance` vs. `/:id`**: NestJS puede confundir el segmento `balance` como parte del parámetro `id`. Mitigación: el segmento `balance` se registra como ruta estática anidada dentro de `/:id`, lo que NestJS resuelve correctamente.
- **Balance desactualizado**: en v1, el balance se toma del campo `balance` de `BankAccount` (no se recalcula sumando movimientos). Si hay drift, el balance puede no reflejar el estado real. Mitigación: documentar la limitación y planificar el cálculo dinámico en Fase 14.

## Documentación a actualizar
- `apps/api/src/modules/bank-accounts/bank-accounts.controller.ts` — handler `getBalance` agregado.
- `apps/api/src/modules/bank-accounts/bank-accounts.service.ts` — método `getBalanceByAccount` agregado.

## Decisiones clave
- **Balance estático en v1**: el campo `balance` en `BankAccount` se actualiza manualmente o al crear movimientos. No se calcula en tiempo real sumando movimientos porque eso requeriría un agregado costoso. La arquitectura correcta (con triggers o recalculo batch) se define en Fase 14.
- **Endpoint dedicado en lugar de incluir balance en `findOneById`**: el balance puede actualizarse frecuentemente, por lo que tenerlo en un endpoint separado permite cachearlo de forma independiente en el futuro.

## Evidencia documental
- `apps/api/src/modules/bank-accounts/bank-accounts.controller.ts`
- `apps/api/src/modules/bank-accounts/bank-accounts.service.ts`

## Pendientes para la siguiente task
- `T-1326` agrega el endpoint de listado de movimientos por filtros explícitos.

## Pendientes no resueltos
- Ninguno.
