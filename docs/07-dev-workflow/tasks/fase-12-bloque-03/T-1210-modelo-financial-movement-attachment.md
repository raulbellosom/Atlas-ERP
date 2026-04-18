# T-1210 - Crear modelo FinancialMovementAttachment

## Metadatos
- ID: `T-1210`
- Fase: `Fase 12`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `DesktopAgent`

## Objetivo
Crear la entidad puente `FinancialMovementAttachment` que vincula un `FinancialMovement` con los `Attachment` del sistema de Core Platform. Permite adjuntar uno o varios comprobantes digitales a un movimiento financiero sin duplicar la lógica de almacenamiento de archivos.

## Alcance
- Crear modelo `FinancialMovementAttachment` en `apps/api/prisma/schema.prisma`.
- Campos: id, financialMovementId, attachmentId, organizationId, createdById, createdAt.
- Relaciones: con `FinancialMovement`, `Attachment` (Core Platform), `Organization`, `User` (createdBy).
- Definir índices: por `financialMovementId`, por `attachmentId`.
- Ejecutar `prisma generate`, `typecheck` y `lint`.

## Fuera de alcance
- No incluye lógica de subida de archivos (eso es responsabilidad de `Attachment` en Core Platform).
- No incluye la migración SQL (eso es `T-1219`).
- No incluye endpoints ni DTOs (eso es Fase 13).
- No incluye soft-delete propio (si el movimiento se elimina, los adjuntos se desvinculan en cascada o se mantienen en `Attachment`).

## Dependencias
- `T-1209` (`FinancialMovement`): la FK `financialMovementId` requiere que `FinancialMovement` exista en el schema.
- `Attachment` de Core Platform: la FK `attachmentId` referencia una entidad de Core Platform ya disponible en el schema.
- `T-1204` (relaciones Core Platform): el uso de `Attachment` de Core Platform fue declarado como lineamiento en el blueprint.

## Criterios de aceptación
- [x] Modelo `FinancialMovementAttachment` creado en `schema.prisma`.
- [x] Relaciones con `FinancialMovement`, `Attachment`, `Organization` y `User` definidas.
- [x] Índices base de consulta definidos.
- [x] `prisma generate`, `typecheck` y `lint` en verde.

## Validaciones
- Verificar que `attachmentId` referencia el modelo `Attachment` correcto de Core Platform (nombre y ubicación en schema).
- Confirmar que la backrelation en `FinancialMovement` es `attachments FinancialMovementAttachment[]`.
- Revisar que no se aplica soft-delete a la entidad puente (no tiene `deletedAt`).

## Pruebas
- `pnpm prisma validate` — sin errores de schema.
- `pnpm prisma generate` — cliente Prisma generado con `FinancialMovementAttachment`.
- `pnpm typecheck` — sin errores TypeScript en `apps/api`.

## Riesgos
- **Referencia a `Attachment` incorrecta**: si el nombre del modelo en Core Platform difiere, Prisma dará error. Mitigación: revisar el schema de Core Platform antes de crear la FK.
- **Cascada al eliminar Attachment**: si se elimina un `Attachment`, el registro en `FinancialMovementAttachment` queda con FK inválida. Mitigación: definir `onDelete: Cascade` o `Restrict` según la política de datos del canon.

## Documentación a actualizar
- `apps/api/prisma/schema.prisma` — añadir modelo `FinancialMovementAttachment`.

## Decisiones clave
- **Entidad puente explícita en lugar de relación implícita**: se crea como modelo propio para poder registrar `createdById` y `createdAt` en el acto de vinculación, manteniendo trazabilidad de quién adjuntó el comprobante.

## Evidencia documental
- `apps/api/prisma/schema.prisma` — modelo `FinancialMovementAttachment`.

## Pendientes para la siguiente task
- `T-1211` crea el modelo `Transfer` para transferencias entre cuentas internas.

## Pendientes no resueltos
- Ninguno.
