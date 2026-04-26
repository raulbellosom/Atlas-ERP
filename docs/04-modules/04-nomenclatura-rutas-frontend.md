# Nomenclatura de Rutas Frontend

## ID de convención
- Task origen: `T-0020`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Regla base
- Las rutas frontend usan `kebab-case`.
- Los segmentos se organizan por módulo y recurso.
- Evitar rutas ambiguas o dependientes de texto visible.

## Estructura recomendada
- Base de módulo: `/<modulo>`
- Listado: `/<modulo>/<recurso>`
- Detalle: `/<modulo>/<recurso>/:id`
- Crear: `/<modulo>/<recurso>/new`
- Editar: `/<modulo>/<recurso>/:id/edit`

## Ejemplos
- `/financial-operations/bank-accounts`
- `/financial-operations/movements`
- `/sync-center/conflicts`

## Restricciones
- No usar espacios, acentos ni mayúsculas en paths.
- No exponer nombres internos sensibles en la URL.
- Mantener estabilidad de rutas para evitar rompimientos de navegación.

