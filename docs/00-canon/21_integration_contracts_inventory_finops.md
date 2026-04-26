# Contratos de Integración: Inventory Core ↔ Financial Operations Core / Accounting Core

**Versión:** 1.0
**Fecha:** 2026-04-18
**Task origen:** T-2207 (Fase 22 Bloque 2)

---

## Principio de diseño

Inventory Core registra movimientos de existencias. El costo de dichos movimientos impacta Accounting Core (asientos de costo) y ocasionalmente Financial Operations Core (ajustes de activo físico con efecto financiero).

---

## Contrato de evento: `inventory.movement.posted`

**Publicado por:** `InventoryService.postMovement()` al confirmar una entrada o salida.

```typescript
interface InventoryMovementPostedPayload {
  eventType: 'inventory.movement.posted';
  tenantId: string;
  movementId: string;
  movementType: 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
  productId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  currency: string;
  warehouseId: string;
  movementDate: Date;
  sourceModule?: 'purchases' | 'manual';
  userId: string;
}
```

**Consumido por:**
- `AccountingService.onInventoryMovement(payload)` → genera `JournalEntry` de costo de ventas / entrada de inventario.
- `FinancialOpsService` no consume este evento directamente (los activos de inventario impactan Accounting, no FinOps).

---

## Contrato de evento: `fixed.asset.depreciated`

**Publicado por:** `InventoryService.runDepreciation()` al ejecutar el cálculo periódico.

```typescript
interface FixedAssetDepreciationPayload {
  eventType: 'fixed.asset.depreciated';
  tenantId: string;
  fixedAssetId: string;
  period: string;      // ej. '2026-04'
  depreciationAmount: number;
  currency: string;
  bookValue: number;   // valor en libros después de la depreciación
}
```

**Consumido por:** `AccountingService.onFixedAssetDepreciation(payload)` → genera `JournalEntry` de gasto por depreciación.

---

## Garantías del contrato

1. Inventory no accede directamente a `JournalEntry` — solo emite eventos.
2. Los ajustes de inventario que afectan el valor financiero de activos requieren autorización explícita.
3. El costo unitario usado en el evento es el calculado por el método de valuación configurado (promedio/FIFO).
