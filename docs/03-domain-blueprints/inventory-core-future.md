# Inventory Core Blueprint (Refinado post-v1)

**Versión:** 2.0
**Fecha refinamiento:** 2026-04-18
**Task origen:** T-2203

---

## Propósito

Gestionar el inventario de productos y activos fijos: entradas, salidas, valuación (promedio ponderado/FIFO) y depreciación. El costo de los movimientos de inventario se vincula con Financial Operations Core y Accounting Core.

---

## Entidades

| Entidad | Descripción | Sync offline |
|---------|-------------|--------------|
| `Product` | Artículo de inventario: código, descripción, unidad, costo | Sí (caché) |
| `Warehouse` | Almacén o ubicación física | Sí (caché) |
| `StockLocation` | Ubicación específica dentro del almacén | Sí (caché) |
| `InventoryMovement` | Entrada o salida de inventario: tipo, cantidad, costo unitario | Sí (enqueue write) |
| `StockBalance` | Saldo de inventario por producto/ubicación | Sí (caché snapshot) |
| `InventoryAdjustment` | Ajuste manual con motivo y autorización | No |
| `FixedAsset` | Activo fijo: nombre, costo, vida útil, método de depreciación | No |
| `DepreciationEntry` | Línea de depreciación periódica de un activo | No |

---

## Políticas del módulo (siguiendo patrones de v1)

### Valuación
- Método por defecto: **Promedio ponderado móvil** (configurable por tenant).
- Decisión de método de valuación debe quedar en ADR antes de iniciar Fase 33.

### Auditoría
- `InventoryMovement`, `InventoryAdjustment`, `FixedAsset` generan `AuditLog`.

### Permisos
- `inventory:read` — consultar productos, saldos.
- `inventory:write` — registrar entradas/salidas.
- `inventory:adjust` — autorizar ajustes manuales.
- `inventory:admin` — configurar productos, métodos de valuación.

### Sync
- `Product`, `Warehouse`, `StockBalance` se sincronizan al desktop como catálogos y snapshots.
- `InventoryMovement` puede encolarse offline; confirmación contra servidor al reconectar.
- `InventoryAdjustment`, `FixedAsset`, `DepreciationEntry` son solo servidor.

### Integración con Financial Ops y Accounting
- Compras de inventario desde Purchases Core crean `InventoryMovement` de entrada.
- El costo del inventario consumido genera asientos de costo en Accounting Core.
- El contrato de integración está en `docs/00-canon/21_integration_contracts_inventory.md`.

---

## Fases de implementación proyectadas

1. **Fase 33** — Productos, almacenes, movimientos de inventario
2. **Fase 34** — Valuación + integración con Purchases
3. **Fase 35** — Activos fijos + depreciación + integración Accounting

## Requisitos previos para construirlo

- Purchases Core operativo.
- Blueprint funcional y técnico de Inventory Core aprobados.
- ADR de método de valuación firmado.

## Estrategia de linking con activos y estados de resultados (Anexo T-2211)

### Método de valuación para posting contable

- **Método por defecto:** Promedio ponderado móvil (PPM). El costo unitario que se envía al PostingEngine de Accounting refleja el PPM calculado al momento del movimiento.
- **Reportes fiscales:** FIFO puede calcularse a nivel de reporte sin cambiar el método de costeo transaccional — se aplica como una vista derivada sobre los movimientos, no cambia el `JournalEntry` base.

### Granularidad del linking

- Cada `InventoryMovement` emite un evento separado → genera un `JournalEntry` separado en Accounting.
- No se agregan movimientos: la trazabilidad 1:1 entre movimiento de inventario y asiento contable es requisito.

### Activos fijos

- Los activos fijos son entidades separadas del inventario circulante. No se usan los mismos algoritmos de PPM/FIFO.
- La depreciación es calculada por período (mensual) con el método elegido al dar de alta el activo (lineal o suma de dígitos).
- La depreciación es irreversible — correcciones se hacen con asientos manuales autorizados.

## Estado

`futuro` — No iniciar sin blueprint técnico aprobado.
