# Conflict Resolution Skill

## ID de task origen

- `T-0130`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Guiar la implementación de resolución de conflictos de sincronización en AtlasERP.

## Procedimiento

### 1. Detección de conflictos

Un conflicto ocurre cuando:

- El cliente envía una actualización basada en una versión anterior a la del servidor.
- El cliente intenta crear un registro que ya existe en el servidor.
- El cliente envía una eliminación de un registro que fue modificado en el servidor.
- Una referencia del cliente apunta a una entidad que cambió o fue eliminada en el servidor.

### 2. Tipos de conflicto

| Tipo                     | Descripción                                                    |
| ------------------------ | -------------------------------------------------------------- |
| `EDIT_CONFLICT`          | Edición concurrente del mismo registro.                        |
| `DELETE_EDIT_CONFLICT`   | Eliminación local vs. edición en servidor (o viceversa).       |
| `DUPLICATE_CONFLICT`     | Creación duplicada detectada.                                  |
| `REFERENCE_CONFLICT`     | Referencia a entidad que cambió/desapareció.                   |
| `BUSINESS_RULE_CONFLICT` | Regla de negocio impide la operación (ej: saldo insuficiente). |

### 3. Resolución

Opciones disponibles desde el Sync Center:

- **Aprobar local**: usar versión del cliente, descartar versión del servidor.
- **Conservar servidor**: mantener versión del servidor, descartar versión del cliente.
- **Descartar local**: eliminar operación local sin aplicarla.
- **Merge manual**: combinar campos seleccionados de ambas versiones.

### 4. Flujo en Sync Center

1. Listar conflictos pendientes con detalle visual (diff).
2. Mostrar ambas versiones lado a lado.
3. Resaltar campos que difieren.
4. Permitir seleccionar acción por conflicto.
5. Confirmar antes de aplicar resolución.
6. Auditar la resolución aplicada.

### 5. Permisos

- Solo usuarios con permiso `sync.resolve_conflicts` pueden resolver conflictos.
- Las resoluciones de entidades financieras pueden requerir permiso adicional.

### 6. Auditoría

Cada resolución genera un AuditLog con:

- Tipo de conflicto.
- Acción tomada (aprobar local, conservar servidor, descartar, merge).
- Detalle de campos afectados.
- Actor que resolvió.

### 7. Restricciones

- No resolver automáticamente conflictos en datos financieros o sensibles.
- No permitir merge manual sin mostrar diff claro.
- Toda resolución es irreversible una vez aplicada.

## Referencia

- `docs/05-sync/01-politica-resolucion-conflictos.md`
- `docs/00-canon/03_sync_principles.md`
