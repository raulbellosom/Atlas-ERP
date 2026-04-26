# Nomenclatura de Endpoints Backend

## ID de convención
- Task origen: `T-0021`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Convención oficial
- Prefijo base: `/api/v1`.
- Segmentos en `kebab-case`.
- Recursos REST en plural cuando representen colecciones.
- Parámetros dinámicos con `:id` u otro identificador explícito.

## Estructura recomendada
- Listado: `GET /api/v1/<modulo>/<recurso>`
- Detalle: `GET /api/v1/<modulo>/<recurso>/:id`
- Crear: `POST /api/v1/<modulo>/<recurso>`
- Editar: `PATCH /api/v1/<modulo>/<recurso>/:id`
- Eliminar lógico: `DELETE /api/v1/<modulo>/<recurso>/:id` (según política del módulo)

## Acciones no CRUD
- Usar subrutas explícitas:
  - `POST /api/v1/<modulo>/<recurso>/:id/approve`
  - `POST /api/v1/<modulo>/<recurso>/:id/reject`
- Evitar verbos genéricos ambiguos en la ruta.

## Restricciones
- No usar camelCase ni PascalCase en paths.
- No exponer detalles internos de implementación.
- Mantener estabilidad de rutas y versionar cambios incompatibles.

