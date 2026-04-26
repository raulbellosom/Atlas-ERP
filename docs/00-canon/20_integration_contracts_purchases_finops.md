# Contratos de Integración: Purchases Core ↔ Financial Operations Core

**Versión:** 1.0
**Fecha:** 2026-04-18
**Task origen:** T-2206 (Fase 22 Bloque 2)

---

## Principio de diseño

Purchases Core genera obligaciones de pago a proveedores que se convierten en `Payable` (CxP) en Financial Operations Core. Los pagos ejecutados desde FinOps confirman las facturas del proveedor en Purchases.

---

## Contrato de evento: `vendor.invoice.confirmed`

**Publicado por:** `PurchasesService.confirmVendorInvoice()`.

```typescript
interface VendorInvoicePayablePayload {
  eventType: 'vendor.invoice.confirmed';
  tenantId: string;
  vendorInvoiceId: string;
  vendorId: string;
  vendorName: string;
  totalAmount: number;
  currency: string;
  paymentDueDate: Date;
  purchaseOrderId?: string;
  userId: string;
}
```

**Consumido por:** `FinancialOpsService.onVendorInvoiceConfirmed(payload)` → crea `Payable` (CxP) vinculado al proveedor.

---

## Contrato de evento: `vendor.payment.applied`

**Publicado por:** `FinancialOpsService` al marcar un `Payable` como pagado.

```typescript
interface VendorPaymentAppliedPayload {
  eventType: 'vendor.payment.applied';
  tenantId: string;
  payableId: string;
  vendorInvoiceId: string;
  amountPaid: number;
  currency: string;
  paymentDate: Date;
  bankAccountId: string;
}
```

**Consumido por:** `PurchasesService.onVendorPaymentApplied(payload)` → marca `VendorInvoice` como pagada (parcial o total).

---

## Flujo completo

```
PurchaseOrder confirmada
  → GoodsReceipt registrado
  → VendorInvoice confirmada
  → [evento: vendor.invoice.confirmed]
  → Payable (CxP) creado en FinOps
  → Pago ejecutado en FinOps
  → FinancialMovement de egreso creado
  → [evento: vendor.payment.applied]
  → VendorInvoice marcada pagada en Purchases
```

---

## Garantías del contrato

1. Purchases no accede directamente a `FinancialMovement` — solo emite y escucha eventos.
2. FinOps no conoce detalles de la orden de compra — solo recibe el monto de la factura.
3. La consistencia eventual entre `VendorInvoice` y `Payable` es aceptable para v2.
