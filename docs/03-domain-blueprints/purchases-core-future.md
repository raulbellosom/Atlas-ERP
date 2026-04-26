# Purchases Core Blueprint (Refinado post-v1)

**Versión:** 2.0
**Fecha refinamiento:** 2026-04-18
**Task origen:** T-2202

---

## Propósito

Gestionar el ciclo de compras: proveedores, órdenes de compra, recepción de mercancía, facturas de proveedor y pagos. Los pagos se vinculan con Financial Operations Core (CxP + movimientos de egreso).

---

## Entidades

| Entidad | Descripción | Sync offline |
|---------|-------------|--------------|
| `Vendor` | Proveedor: nombre, RFC/NIT, términos de pago | Sí (caché) |
| `PurchaseOrder` | Orden de compra: líneas de artículos, cantidades, precios | Sí (enqueue write) |
| `PurchaseOrderLine` | Línea individual de una orden de compra | Sí (enqueue write) |
| `VendorInvoice` | Factura del proveedor: monto, impuestos, fecha vencimiento | No |
| `PurchaseReceipt` | Registro de recepción de mercancía | Sí (enqueue write) |
| `VendorPayment` | Pago a proveedor vinculado a `Payable` de FinOps | No |

---

## Políticas del módulo (siguiendo patrones de v1)

### Auditoría
- `PurchaseOrder`, `VendorInvoice`, `VendorPayment` generan `AuditLog`.
- Aprobación de órdenes de compra requiere doble firma si monto > umbral configurable.

### Permisos
- `purchases:read` — consultar órdenes, facturas.
- `purchases:write` — crear órdenes, registrar recepciones.
- `purchases:approve` — aprobar órdenes de compra.
- `purchases:pay` — autorizar pagos a proveedor.

### Sync
- `Vendor` y `PurchaseOrder` aprobadas se sincronizan al desktop.
- Las recepciones pueden encolarse offline; se confirman contra servidor al reconectar.

### Integración con Financial Ops
- Al confirmar `VendorInvoice` → crea `Payable` (CxP) en FinOps.
- Al ejecutar `VendorPayment` → crea `FinancialMovement` de egreso en FinOps.
- El contrato de integración está en `docs/00-canon/20_integration_contracts_purchases.md`.

---

## Fases de implementación proyectadas

1. **Fase 26** — Proveedores, órdenes de compra, recepciones
2. **Fase 27** — Facturas de proveedor + integración CxP/FinOps
3. **Fase 28** — Pagos, conciliación con estados de cuenta

## Requisitos previos para construirlo

- Financial Operations Core completado y estable (v1 aprobado).
- Accounting Core con entidades de diario operativas.
- Blueprint funcional y técnico de Purchases Core aprobados.

## Reglas de cancelación y reverso (Anexo T-2210)

Las siguientes reglas deben ser respetadas por Financial Operations Core al integrar pagos de compras:

1. **Un `FinancialMovement` generado desde `VendorInvoice` no puede anularse directamente** — debe generarse un evento compensatorio desde Purchases (`vendor.invoice.cancelled`) que propague la cancelación.
2. **Los pagos a proveedor agrupados** (múltiples facturas en un solo `FinancialMovement`) registran el `payableId` de cada factura en metadatos para trazabilidad.
3. **Orden de cancelación**: `VendorPayment` → `Payable` marcado como revertido → evento `vendor.payment.reversed` → Purchases revierte `VendorInvoice` a estado PENDIENTE.

Estas reglas se implementarán como validaciones en el `FinancialMovementsService` cuando se construya la integración con Purchases Core (Fase 27).

## Estado

`futuro` — No iniciar sin blueprint técnico aprobado.
