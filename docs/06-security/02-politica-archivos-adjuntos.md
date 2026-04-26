# Política de Archivos y Adjuntos

## ID de política
- Task origen: `T-0031`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir reglas de gestión de archivos y adjuntos para seguridad, trazabilidad y consistencia operativa.

## Reglas
- Todo adjunto debe vincularse a una entidad de dominio válida.
- Debe registrarse actor, fecha y origen de la operación de adjunto.
- Tipos de archivo permitidos deben definirse por módulo cuando aplique.
- El almacenamiento debe usar servicio compatible S3 (MinIO/S3).
- Los metadatos del adjunto deben incluir referencia de ownership del módulo.

## Seguridad mínima
- Validar tamaño y tipo de archivo.
- Evitar ejecución de contenido no confiable.
- No exponer rutas internas del storage en respuestas públicas.

## Restricciones
- Prohibido adjuntar archivos sin referencia de entidad.
- Prohibido almacenar secretos en adjuntos de negocio.

