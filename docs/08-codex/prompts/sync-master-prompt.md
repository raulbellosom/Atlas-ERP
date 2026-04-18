# Sync Master Prompt

## ID de task origen

- `T-0116`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Instrucción

Implementa sincronización controlada para AtlasERP. El servidor es la fuente de verdad. Los clientes pueden trabajar parcialmente offline y sincronizar después.

### Principios

- No asumir resolución automática total; los conflictos en datos sensibles requieren revisión humana.
- Usar cola local en SQLite para operaciones offline.
- Validar todo en servidor al sincronizar.
- Detectar conflictos de forma explícita.
- Registrar todo en un Sync Center donde un usuario autorizado pueda:
  - Aprobar versión local.
  - Conservar versión del servidor.
  - Descartar cambios locales.
  - Fusionar manualmente cuando aplique.
- Mantener trazabilidad completa: toda resolución debe auditarse.

### Contratos de sync

- Cada operación tiene un payload versionado.
- Cada entidad sincronizable declara su sync policy (qué se permite offline).
- La cola local soporta retries, idempotencia y detección de duplicados.

### Modelos de datos

- SyncSession: sesión de sincronización.
- SyncItem: operación individual encolada.
- ConflictRecord: conflicto detectado.
- ConflictResolution: resolución aplicada.
- SyncLog: log de operaciones de sync.
- DeviceRegistry: dispositivos registrados.

### Flujo general

1. Cliente encola operación en SQLite local.
2. Al reconectar, cliente envía batch al servidor.
3. Servidor valida cada item.
4. Si hay conflicto: genera ConflictRecord.
5. Si no hay conflicto: aplica y confirma.
6. Cliente recibe resultado y actualiza estado local.
7. Conflictos se resuelven desde Sync Center.

### Restricciones

- La cola local debe sobrevivir reinicios de la app.
- No implementar offline total.
- No resolver automáticamente conflictos en entidades financieras o sensibles.
- Toda resolución genera AuditLog.

### Referencia

- `docs/00-canon/03_sync_principles.md`
- `docs/05-sync/00-politica-soporte-offline.md`
- `docs/05-sync/01-politica-resolucion-conflictos.md`
- `docs/03-domain-blueprints/sync-core.md`
