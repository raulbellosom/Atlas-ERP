# T-1317 - Crear servicios de BalanceSnapshot

## Metadatos
- ID: `T-1317`
- Fase: `Fase 13`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Expandir `BalanceSnapshotsService` con la operación de creación de cortes de saldo, permitiendo registrar snapshots históricos de saldo bancario.

## Alcance
- Método agregado en `BalanceSnapshotsService`:
  - `create(dto: CreateBalanceSnapshotInput)`: registra un corte de saldo con conversión de `snapshotAt` a `Date` y defaults para `currencyCode` y `source`.
- Se conservan métodos de consulta existentes: `findAll`, `findOneById`, `findLatestByBankAccount`.
- Decisión explícita: **no se agrega `softDelete`** porque `BalanceSnapshot` no tiene `deletedAt` y se trata como registro histórico inmutable.

## Fuera de alcance
- Cálculo automático de saldo basado en movimientos (eso es Fase 14).
- Snapshot automático programado (eso es infraestructura, Fase 14+).
- Endpoint HTTP de creación (eso es T-1317 solo agrega el servicio; el endpoint se agrega en Bloque 5 si aplica).

## Dependencias
- `T-1304`: servicio base ya existe con métodos de consulta.
- `T-1215` a `T-1218` (Fase 12): modelo Prisma `BalanceSnapshot` sin `deletedAt`.

## Criterios de aceptación
- [x] Servicio de `BalanceSnapshot` ampliado con operación de escritura base (`create`).
- [x] Conversión de `snapshotAt` a `Date` y defaults de `currencyCode`/`source`.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- Llamar `create()` con `snapshotAt` ISO — debe crear snapshot con `Date` correcta y source por defecto `MANUAL`.
- Llamar `create()` sin `currencyCode` — debe usar default `MXN` (o el configurado).
- Verificar que `findLatestByBankAccount` retorna el snapshot más reciente tras crear varios.

## Riesgos
- **Snapshot duplicado**: si se crea un snapshot para la misma cuenta y el mismo timestamp, podría haber confusión en consultas de "último snapshot". Mitigación: el servicio puede verificar si ya existe un snapshot con mismo `bankAccountId` y `snapshotAt` antes de crear.
- **Balance desincronizado**: el `balance` del snapshot se recibe del DTO, no se calcula automáticamente. Si el llamante envía un balance incorrecto, el snapshot queda con datos erróneos. Mitigación: en Fase 14 se agrega lógica de cálculo automático.

## Documentación a actualizar
- `apps/api/src/modules/balance-snapshots/balance-snapshots.service.ts` — método `create` agregado.

## Decisiones clave
- **Sin softDelete**: los snapshots de saldo son registros históricos de auditoría. Eliminarlos (incluso lógicamente) comprometería la integridad del historial financiero. Esta es una decisión de diseño deliberada y documentada.
- **Source por defecto `MANUAL`**: al crear un snapshot vía API, el origen es `MANUAL`. En versiones futuras, los snapshots automáticos tendrán `source: 'AUTOMATED'`.

## Evidencia documental
- `apps/api/src/modules/balance-snapshots/balance-snapshots.service.ts`

## Pendientes para la siguiente task
- `T-1318` expande `ReceivablesLiteService` con escritura.

## Pendientes no resueltos
- Ninguno.
