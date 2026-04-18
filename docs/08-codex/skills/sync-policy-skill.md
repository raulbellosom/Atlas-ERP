# Sync Policy Skill

## ID de task origen

- `T-0129`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Guiar la definición de políticas de sincronización por entidad en AtlasERP.

## Procedimiento

### 1. Preguntas por entidad

Para cada entidad sincronizable, responder:

| Pregunta                                       | Opciones                                                     |
| ---------------------------------------------- | ------------------------------------------------------------ |
| ¿Se puede crear offline?                       | sí / no                                                      |
| ¿Se puede editar offline?                      | sí / no / parcial (solo ciertos campos)                      |
| ¿Se puede eliminar offline?                    | sí / no                                                      |
| ¿Qué conflictos puede generar?                 | edición concurrente / eliminación-edición / referencia rota  |
| ¿Requiere revisión manual de conflictos?       | siempre / solo en campos sensibles / nunca                   |
| ¿Qué campos son críticos (no auto-mergeables)? | lista de campos                                              |
| ¿Qué pasa si la referencia remota cambió?      | rechazar / mantener con advertencia / actualizar             |
| ¿Cuál es el comportamiento del Sync Center?    | mostrar diff / permitir merge manual / solo aprobar/rechazar |

### 2. Clasificación de entidades

#### Siempre online (no sincronizables offline)

- Resoluciones de conflictos.
- Cambios de roles/permisos.
- Configuraciones del sistema.
- Feature flags.

#### Offline con restricciones

- Movimientos financieros (crear sí, editar parcial, eliminar no).
- Transferencias (crear sí, editar no, eliminar no).
- Adjuntos (crear cola de subida, no editar/eliminar offline).

#### Offline con resolución automática segura

- Borradores o notas internas.
- Datos de solo lectura cacheados.

### 3. Declaración en blueprint

Cada módulo debe incluir en su blueprint una sección de sync policy con la tabla completada para cada entidad.

### 4. Implementación

- Agregar campos de sync al modelo Prisma (`syncStatus`, `localVersion`, `serverVersion`).
- Registrar reglas en archivo de configuración de sync del módulo.
- Implementar validación en el endpoint de sync batch.

### 5. Restricciones

- Datos financieros sensibles no permiten auto-merge.
- Toda resolución de conflicto debe auditarse.
- No permitir offline total; siempre parcial y controlado.

## Referencia

- `docs/00-canon/03_sync_principles.md`
- `docs/05-sync/00-politica-soporte-offline.md`
- `docs/05-sync/01-politica-resolucion-conflictos.md`
