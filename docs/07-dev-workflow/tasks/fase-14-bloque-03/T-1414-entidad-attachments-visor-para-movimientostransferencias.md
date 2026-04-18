# T-1414 - Entidad Attachments: visor para movimientos/transferencias

## Metadatos
- ID: `T-1414`
- Fase: `Fase 14`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar el componente visor de adjuntos/comprobantes compartido entre las vistas de detalle de movimientos y transferencias, permitiendo previsualizar y descargar documentos adjuntos.

## Alcance
- Crear componente reutilizable `AttachmentViewer`.
- Funcionalidades:
  - Lista de adjuntos vinculados (nombre, tipo, fecha de upload).
  - Previsualización inline para imágenes (JPG, PNG, PDF thumbnail).
  - Botón de descarga por adjunto.
  - Botón "Adjuntar comprobante" con upload de archivo.
- Integración con:
  - `GET /api/v1/financial-movements/:id/attachments` — lista de comprobantes.
  - `POST /api/v1/financial-movements/:id/attachments/upload` — upload de nuevo comprobante.
- Reutilizable en: `MovementDetailPage` (T-1409) y `TransferDetailPage` (T-1413).

## Fuera de alcance
- Previsualización de PDFs completa (Fase 15+).
- Firma digital de comprobantes (Fase 15+).
- Adjuntos de transferencias directamente (en v1 los adjuntos se vinculan a los movimientos).

## Dependencias
- `T-1409`: `MovementDetailPage` que usa el visor.
- `T-1413`: `TransferDetailPage` que usa el visor.
- `T-1330`: endpoint de upload disponible.

## Criterios de aceptación
- [x] Componente `AttachmentViewer` reutilizable implementado.
- [x] Lista de adjuntos con previsualización de imágenes.
- [x] Upload de nuevo comprobante funcional.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: upload y visualización de comprobante demo funcional.

## Pruebas
- Adjuntar imagen JPG — aparece en lista de adjuntos con preview.
- Clic en "Descargar" — inicia descarga del archivo.
- Sin adjuntos — mensaje "Sin comprobantes adjuntos".
- Límite de tamaño de archivo excedido — mensaje de error al usuario.

## Riesgos
- **URL de previsualización**: las URLs de los adjuntos pueden requerir autenticación (si están en storage privado). Mitigación: el backend debe retornar URLs firmadas con expiración corta.
- **Tipos de archivo no previsualizable**: PDFs y archivos .xlsx no tienen preview inline. Mitigación: mostrar icono de tipo de archivo en lugar de preview para formatos no soportados.

## Documentación a actualizar
- `apps/web/src/modules/finops/components/AttachmentViewer.jsx` — archivo nuevo.
- `apps/web/src/modules/finops/hooks/useAttachments.js`.

## Decisiones clave
- **Componente compartido entre movimientos y transferencias**: el visor de adjuntos es idéntico en ambos contextos. Reutilizar el componente evita duplicación y centraliza la lógica de upload/visualización.
- **Upload en dos pasos en frontend**: el componente primero sube el archivo al `AttachmentsService` del backend y luego vincula el ID del adjunto al movimiento/transferencia. El usuario ve un solo flujo de upload.

## Evidencia documental
- `apps/web/src/modules/finops/components/AttachmentViewer.jsx`
- `apps/web/src/modules/finops/hooks/useAttachments.js`

## Pendientes para la siguiente task
- `T-1415` (Bloque 4) implementa el listado y creación de sesiones de conciliación.

## Pendientes no resueltos
- Ninguno.
