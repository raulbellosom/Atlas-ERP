# T-1319 - Crear servicios de PayablesLite

## Metadatos
- ID: `T-1319`
- Fase: `Fase 13`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Expandir `PayablesLiteService` con las operaciones de escritura base (create, update, softDelete) necesarias para que los endpoints CRUD del módulo queden operativos en T-1324. Con este servicio se completan los 7 servicios de escritura del dominio.

## Alcance
- Métodos agregados en `PayablesLiteService`:
  - `create(dto: CreatePayableLiteDto)`: registra una cuenta por pagar con conversión de fecha de vencimiento.
  - `update(id: string, dto: UpdatePayableLiteDto)`: actualiza campos. Lanza `NotFoundException` si no existe.
  - `softDelete(id: string)`: marca la CxP como eliminada (`deletedAt`). Lanza `NotFoundException` si no existe.
- Se conservan métodos de consulta existentes: `findAll`, `findOneById`, `countOverdueByOrganization`.

## Fuera de alcance
- Integración con flujo de pago a proveedores (Fase 14+).
- Integración con auditoría (eso es T-1331).

## Dependencias
- `T-1312`: DTOs `CreatePayableLiteDto` y `UpdatePayableLiteDto` disponibles.
- `T-1306`: servicio base ya existe con métodos de consulta.

## Criterios de aceptación
- [x] Servicio de `PayablesLite` ampliado con operaciones de escritura base.
- [x] Soft delete aplicado mediante `deletedAt`.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- Llamar `create()` — debe crear CxP con `status: PENDING` y `deletedAt: null`.
- Llamar `softDelete(id)` — debe establecer `deletedAt`.
- Verificar que `countOverdueByOrganization` excluye CxP soft-deleted y no vencidas.

## Riesgos
- **Mismo riesgo de countOverdue que ReceivablesLite**: la query debe filtrar `deletedAt: null` y `dueDate: { lt: new Date() }`.

## Documentación a actualizar
- `apps/api/src/modules/payables-lite/payables-lite.service.ts` — métodos `create`, `update`, `softDelete` agregados.

## Decisiones clave
- **Simetría con ReceivablesLiteService**: el patrón es idéntico para mantener coherencia entre CxC y CxP. Los 7 servicios del dominio ahora tienen operaciones de escritura base completas, habilitando el Bloque 5 (endpoints CRUD).

## Evidencia documental
- `apps/api/src/modules/payables-lite/payables-lite.service.ts`

## Pendientes para la siguiente task
- `T-1320` (Bloque 5) expone los endpoints CRUD de `BankAccounts`.

## Pendientes no resueltos
- Ninguno.
