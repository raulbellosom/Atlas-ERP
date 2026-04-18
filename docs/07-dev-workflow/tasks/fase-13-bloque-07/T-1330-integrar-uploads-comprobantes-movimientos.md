# T-1330 - Integrar uploads/comprobantes a movimientos

## Metadatos
- ID: `T-1330`
- Fase: `Fase 13`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Permitir la carga y consulta de comprobantes (adjuntos) asociados a movimientos financieros, integrando el módulo de adjuntos existente con el módulo de movimientos financieros.

## Alcance
- Endpoints agregados en `FinancialMovementsController`:
  - `POST /api/v1/financial-movements/:id/attachments/upload` — carga un comprobante y lo vincula al movimiento.
  - `GET /api/v1/financial-movements/:id/attachments` — lista los comprobantes vinculados al movimiento.
- DTO agregado:
  - `UploadMovementAttachmentDto`: referencia al archivo (`attachmentId` o metadata de upload).
- Métodos agregados en `FinancialMovementsService`:
  - `uploadProof(movementId, dto)`: valida existencia del movimiento, crea vínculo `FinancialMovementAttachment`.
  - `listProofs(movementId)`: retorna los adjuntos vinculados al movimiento.
- Integración con `AttachmentsService`:
  - Reutiliza `AttachmentsService.uploadAttachment()` para la carga física.
  - Crea registro `FinancialMovementAttachment` para el vínculo.
- `FinancialMovementsModule` actualizado para importar `AttachmentsModule`.

## Fuera de alcance
- Carga de archivos directamente en este endpoint (usa referencia a un adjunto ya subido).
- Validación de formato de archivo (eso es `AttachmentsModule`).
- Auditoría del vínculo de comprobante (eso es T-1331).

## Dependencias
- `T-1321`: endpoints CRUD de `FinancialMovements` disponibles.
- `AttachmentsModule`: módulo de adjuntos existente en el backend.
- `T-1200` a `T-1222` (Fase 12): modelo `FinancialMovementAttachment` en Prisma.

## Criterios de aceptación
- [x] El módulo de movimientos acepta carga de comprobantes en endpoint dedicado.
- [x] El módulo de movimientos lista comprobantes vinculados por movimiento.
- [x] Se valida existencia del movimiento antes de crear vínculo.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `POST /api/v1/financial-movements/:id/attachments/upload` con movimiento existente → 201 con vínculo creado.
- `POST /api/v1/financial-movements/:id/attachments/upload` con movimiento inexistente → 404.
- `GET /api/v1/financial-movements/:id/attachments` → 200 con lista de adjuntos vinculados.
- `GET /api/v1/financial-movements/:id/attachments` para movimiento sin comprobantes → 200 con array vacío.

## Riesgos
- **AttachmentsModule circular**: si `FinancialMovementsModule` importa `AttachmentsModule` y este a su vez importa algo de `FinancialMovementsModule`, se genera una dependencia circular. Mitigación: verificar que `AttachmentsModule` no importa `FinancialMovementsModule`.
- **Movimiento soft-deleted con comprobantes**: si se elimina lógicamente un movimiento, sus comprobantes quedan huérfanos. En v1 esto es aceptable — el listado de proofs de un movimiento soft-deleted retorna 404.

## Documentación a actualizar
- `apps/api/src/modules/financial-movements/financial-movements.controller.ts`
- `apps/api/src/modules/financial-movements/financial-movements.service.ts`
- `apps/api/src/modules/financial-movements/dto/upload-movement-attachment.dto.ts` — archivo nuevo.
- `apps/api/src/modules/financial-movements/financial-movements.module.ts` — importar `AttachmentsModule`.

## Decisiones clave
- **Vínculo como entidad propia (`FinancialMovementAttachment`)**: en lugar de agregar un campo de array a `FinancialMovement`, el vínculo es una entidad de unión. Esto permite metadata adicional por vínculo (como `uploadedAt`, `uploadedBy`) en el futuro.
- **Upload en dos pasos**: el archivo se sube primero a `AttachmentsService` (con su URL/storage key) y luego se vincula al movimiento. Esto desacopla el almacenamiento físico del dominio financiero.

## Evidencia documental
- `apps/api/src/modules/financial-movements/financial-movements.controller.ts`
- `apps/api/src/modules/financial-movements/financial-movements.service.ts`
- `apps/api/src/modules/financial-movements/dto/upload-movement-attachment.dto.ts`
- `apps/api/src/modules/financial-movements/financial-movements.module.ts`

## Pendientes para la siguiente task
- `T-1331` integra `AuditService` en todos los servicios críticos del módulo.

## Pendientes no resueltos
- Ninguno.
