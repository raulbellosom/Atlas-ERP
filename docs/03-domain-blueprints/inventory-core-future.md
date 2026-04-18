# Inventory Core Blueprint (Future)

## Propósito
Gestionar el inventario físico de la organización: productos, existencias, movimientos de entrada/salida y valoración.

## Alcance futuro
Este módulo se construirá después de Purchases Core. Requiere blueprint técnico aprobado antes de iniciar.

## Entidades futuras
- `Product` — producto o artículo inventariable con SKU y descripción
- `Warehouse` — almacén o ubicación física
- `StockLocation` — ubicación dentro del almacén
- `InventoryMovement` — entrada, salida o ajuste de inventario
- `StockBalance` — saldo actual por producto/ubicación
- `InventoryAdjustment` — ajuste manual con motivo y autorización

## Relaciones con otros módulos
- **Purchases Core**: las recepciones de compra generan movimientos de entrada.
- **Accounting Core**: los movimientos de inventario pueden generar asientos contables (según método de valoración).
- **Financial Operations Core**: los ajustes de inventario con costo afectan reportes financieros.

## Política de sync
- Los saldos de inventario son sincronizables como snapshot hacia el cliente desktop.
- Los movimientos de entrada/salida requieren confirmación en servidor.
- Los ajustes manuales requieren autorización de un rol con permiso explícito.

## Requisitos previos para construirlo
- Purchases Core operativo.
- Blueprint funcional y técnico de Inventory Core aprobados.
- Decisión sobre método de valoración (PEPS, promedio ponderado) documentada en ADR.

## Estado
`futuro` — No iniciar sin blueprint técnico aprobado.
