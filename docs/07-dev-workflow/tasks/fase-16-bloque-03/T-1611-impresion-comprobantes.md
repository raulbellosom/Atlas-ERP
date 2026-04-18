# T-1611 - Crear impresión de comprobantes/resúmenes si aplica

## Metadatos
- ID: `T-1611`
- Fase: `Fase 16`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Implementar la impresión de comprobantes individuales para movimientos financieros y transferencias, generando un documento de tamaño media carta con los datos del registro y los adjuntos vinculados si los hay.

## Alcance
- Definir primero si aplica en v1 (decisión de alcance):
  - **Movimientos**: sí aplica — el tesorero puede necesitar imprimir el comprobante de un ingreso o egreso con su adjunto como respaldo físico.
  - **Transferencias**: sí aplica — comprobante de transferencia entre cuentas.
  - **CxC / CxP**: no aplica en v1 — son registros simples sin comprobante estándar.
- Crear componente `MovementReceiptPdf` usando `@react-pdf/renderer`:
  - Datos: cuenta, tipo, monto, moneda, fecha, descripción, referencia, estatus.
  - Sección de adjuntos: lista de nombres de archivo adjunto (no inline — solo referencia).
  - Tamaño: media carta (5.5 × 8.5 in) o carta completa según contenido.
- Crear componente `TransferReceiptPdf`:
  - Datos: cuenta origen, cuenta destino, monto, moneda, fecha, notas, estatus, aprobado por.
- Botón "Imprimir comprobante" en `MovementDetailPage` y `TransferDetailPage` (web y desktop).
- En desktop: usar `printReport()` (T-1610). En web: descarga PDF directamente.

## Fuera de alcance
- Comprobante con firma digital o QR de verificación (Fase 17+).
- Comprobante para CxC/CxP (no aplica en v1).
- Comprobante con imagen del adjunto embebida en el PDF (Fase 17+).

## Dependencias
- `T-1409`: `MovementDetailPage` web disponible.
- `T-1413`: `TransferDetailPage` web disponible.
- `T-1609`: componentes base de PDF disponibles.
- `T-1610`: `printReport()` desktop disponible.

## Criterios de aceptación
- [ ] `MovementReceiptPdf` genera PDF con datos correctos del movimiento.
- [ ] `TransferReceiptPdf` genera PDF con datos de la transferencia.
- [ ] Botón "Imprimir comprobante" funcional en web (descarga PDF) y desktop (diálogo de impresión).
- [ ] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Prueba manual: movimiento → "Imprimir comprobante" → PDF descargado con todos los datos → legible e imprimible.

## Pruebas
- Comprobante de movimiento INCOME: todos los campos visibles, sin campos vacíos sin sentido.
- Comprobante de transferencia APPROVED: campo "Aprobado por" con nombre del autorizador.
- Comprobante con 3 adjuntos: sección de adjuntos con 3 nombres de archivo.
- En desktop: botón "Imprimir" → diálogo de impresión del SO.

## Riesgos
- **Datos de "aprobado por" en transferencias**: el campo requiere resolver el `userId` del aprobador al nombre visible. Si el usuario fue eliminado, mostrar "Usuario eliminado" en lugar de UUID.

## Documentación a actualizar
- `apps/web/src/modules/finops/utils/pdf/MovementReceiptPdf.tsx` — archivo nuevo.
- `apps/web/src/modules/finops/utils/pdf/TransferReceiptPdf.tsx` — archivo nuevo.

## Decisiones clave
- **Media carta**: el tamaño media carta (5.5 × 8.5 in) es adecuado para un comprobante individual. Es más práctico que una hoja carta completa para un solo registro. Si el contenido no cabe, se usa carta completa automáticamente.

## Evidencia documental
- `apps/web/src/modules/finops/utils/pdf/MovementReceiptPdf.tsx`
- `apps/web/src/modules/finops/utils/pdf/TransferReceiptPdf.tsx`

## Pendientes para la siguiente task
- `T-1612` implementa el panel de filtros reutilizables para todos los reportes.

## Pendientes no resueltos
- Ninguno.
