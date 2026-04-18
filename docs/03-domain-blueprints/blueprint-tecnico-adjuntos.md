# Blueprint Técnico: Archivos y Adjuntos

## Identificación
- Módulo backend: `apps/api/src/modules/attachments/`
- Almacenamiento: MinIO / S3 compatible
- Referenciado por: cualquier módulo que soporte adjuntos

## Propósito
Gestionar la carga, almacenamiento, recuperación y eliminación de archivos adjuntos a entidades del sistema (movimientos financieros, facturas, comprobantes, etc.).

## Entidad `Attachment`

```
Attachment {
  id           String    @id @default(uuid())
  filename     String    // nombre original del archivo
  storagePath  String    // ruta en MinIO/S3
  mimeType     String
  sizeBytes    Int
  entityType   String    // qué entidad referencia: 'Transaction', 'BankAccount', etc.
  entityId     String    // ID del registro que referencia
  uploadedBy   String    // userId
  createdAt    DateTime  @default(now())
  deletedAt    DateTime? // soft delete
}
```

## Flujo de carga

```
Cliente → POST /attachments/upload (multipart)
       → API valida tipo y tamaño
       → API sube a MinIO/S3
       → API guarda Attachment en PostgreSQL
       → Devuelve attachment con URL pre-firmada temporal
```

## Restricciones de archivos

| Restricción | Valor |
|-------------|-------|
| Tamaño máximo por archivo | 20 MB (configurable por flag) |
| Tipos permitidos | PDF, JPG, PNG, XLSX, CSV (lista blanca) |
| Tipos prohibidos | Ejecutables (.exe, .sh, .bat, etc.) |

## Acceso a archivos
- Las URLs de acceso son pre-firmadas con tiempo de expiración (no son públicas permanentes).
- Solo usuarios con acceso a la entidad padre pueden descargar sus adjuntos.
- El módulo de adjuntos verifica permisos antes de generar la URL.

## Sincronización con desktop
- Los adjuntos no se sincronizan en su totalidad hacia el cliente desktop (son archivos pesados).
- El cliente desktop tiene acceso solo a metadata del adjunto.
- La descarga ocurre bajo demanda, no de forma proactiva.

## Soft delete
- Los adjuntos se eliminan lógicamente (campo `deletedAt`).
- El archivo físico en MinIO/S3 se elimina de forma diferida por un job del worker.
