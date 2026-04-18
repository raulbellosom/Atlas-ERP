# T-1318 - Crear servicios de ReceivablesLite

## Metadatos
- ID: `T-1318`
- Fase: `Fase 13`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Expandir `ReceivablesLiteService` con las operaciones de escritura base (create, update, softDelete) necesarias para que los endpoints CRUD del módulo queden operativos en T-1323.

## Alcance
- Métodos agregados en `ReceivablesLiteService`:
  - `create(dto: CreateReceivableLiteDto)`: registra una cuenta por cobrar con conversión de fecha de vencimiento.
  - `update(id: string, dto: UpdateReceivableLiteDto)`: actualiza campos. Lanza `NotFoundException` si no existe.
  - `softDelete(id: string)`: marca la CxC como eliminada (`deletedAt`). Lanza `NotFoundException` si no existe.
- Se conservan métodos de consulta existentes: `findAll`, `findOneById`, `countOverdueByOrganization`.

## Fuera de alcance
- Integración con flujo de cobro (Fase 14+).
- Envío de recordatorios de vencimiento (Fase 14+).
- Integración con auditoría (eso es T-1331).

## Dependencias
- `T-1311`: DTOs `CreateReceivableLiteDto` y `UpdateReceivableLiteDto` disponibles.
- `T-1305`: servicio base ya existe con métodos de consulta.

## Criterios de aceptación
- [x] Servicio de `ReceivablesLite` ampliado con operaciones de escritura base.
- [x] Soft delete aplicado mediante `deletedAt`.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- Llamar `create()` — debe crear CxC con `status: PENDING` y `deletedAt: null`.
- Llamar `softDelete(id)` — debe establecer `deletedAt`.
- Verificar que `countOverdueByOrganization` no cuenta CxC soft-deleted.

## Riesgos
- **countOverdueByOrganization con soft-deleted**: el conteo de vencidas no debe incluir CxC eliminadas lógicamente. Mitigación: agregar `where: { deletedAt: null }` en la query.

## Documentación a actualizar
- `apps/api/src/modules/receivables-lite/receivables-lite.service.ts` — métodos `create`, `update`, `softDelete` agregados.

## Decisiones clave
- **Conversión de `dueDate`**: el DTO recibe la fecha de vencimiento como string ISO. El servicio convierte a `Date` antes de pasar a Prisma.
- **Estatus inicial forzado**: el servicio fuerza `status: PENDING` al crear, ignorando cualquier valor de estatus que pudiera venir en el DTO.

## Evidencia documental
- `apps/api/src/modules/receivables-lite/receivables-lite.service.ts`

## Pendientes para la siguiente task
- `T-1319` expande `PayablesLiteService` con el mismo patrón.

## Pendientes no resueltos
- Ninguno.
