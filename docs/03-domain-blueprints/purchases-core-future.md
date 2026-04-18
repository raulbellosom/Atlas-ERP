# Purchases Core Blueprint (Future)

## Propósito
Gestionar el ciclo de compras de la organización: proveedores, órdenes de compra, recepciones y cuentas por pagar formales.

## Alcance futuro
Este módulo se construirá después de Financial Operations Core y Accounting Core. Requiere blueprint técnico aprobado antes de iniciar.

## Entidades futuras
- `Supplier` — proveedor con datos fiscales y condiciones
- `PurchaseOrder` — orden de compra con líneas de detalle
- `PurchaseOrderLine` — línea de producto/servicio en la orden
- `GoodsReceipt` — recepción de mercancía o servicio
- `SupplierInvoice` — factura recibida del proveedor
- `PaymentSchedule` — plan de pagos acordado

## Relaciones con otros módulos
- **Financial Operations Core**: los pagos a proveedores generan movimientos financieros.
- **Accounting Core**: las facturas de compra generan asientos contables.
- **Inventory Core**: las recepciones de mercancía afectan el inventario.

## Política de sync
- Las órdenes de compra aprobadas son sincronizables hacia el cliente desktop.
- Las recepciones de mercancía requieren confirmación en servidor antes de afectar inventario.

## Requisitos previos para construirlo
- Financial Operations Core completado y estable.
- Accounting Core con entidades de diario operativas.
- Blueprint funcional y técnico de Purchases Core aprobados.
- Entidades compartidas (Organization, User, Audit) ya implementadas.

## Estado
`futuro` — No iniciar sin blueprint técnico aprobado.
