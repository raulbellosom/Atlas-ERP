# Financial Operations Core Blueprint

## Nombre visible del módulo
Tesorería y Movimientos

## Estado
- Fase: `Fase 12`
- Versión del blueprint: `v1.1`
- Última actualización: `2026-04-13`

## Propósito de negocio (T-1200)
Habilitar control operativo de tesorería en AtlasERP con un modelo simple, auditable y preparado para sincronización offline-first, sin intentar reemplazar contabilidad formal.

El módulo debe resolver:
- Registro y control de cuentas bancarias.
- Captura de ingresos/egresos manuales.
- Transferencias entre cuentas.
- Conciliación básica por sesión.
- Evidencia documental mínima de movimientos.
- Seguimiento simple de cuentas por cobrar y por pagar.

## Alcance exacto v1 (T-1201)
Incluye:
- Gestión de cuentas bancarias activas/inactivas.
- Movimientos financieros manuales con clasificación mínima.
- Transferencias internas entre cuentas de la misma organización.
- Adjuntos de respaldo para movimientos.
- Snapshot de saldo para consulta y corte operativo.
- Conciliación operativa por sesión (apertura, revisión y cierre).
- Cuentas por cobrar y pagar en modalidad simplificada (lite).

## Fuera de alcance v1 (T-1202)
No incluye en esta versión:
- Asientos contables de doble partida.
- Catálogo contable, pólizas y balanza.
- Facturación fiscal y timbrado.
- Integraciones bancarias automáticas (open banking/API bancaria).
- Cálculo de impuestos, depreciaciones y cierre fiscal.
- Motor avanzado de cobranza/pagos con calendarios complejos.
- Multi-moneda con revaluación contable formal.

## Entidades del módulo (T-1203)

| Entidad | Propósito en v1 |
|---|---|
| `BankAccount` | Representa cuenta bancaria operativa por organización. |
| `BankAccountType` *(si aplica)* | Catálogo controlado de tipos de cuenta (cheques, ahorro, caja, etc.). |
| `FinancialMovement` | Registro principal de ingreso/egreso/ajuste operativo. |
| `FinancialMovementAttachment` | Vínculo entre movimiento y archivo de respaldo. |
| `Transfer` | Movimiento doble controlado entre cuentas internas. |
| `ReconciliationSession` | Sesión de conciliación para revisar estado de movimientos. |
| `ReconciliationItem` | Elementos individuales evaluados dentro de una conciliación. |
| `BalanceSnapshot` | Fotografía de saldos por cuenta en un punto de tiempo. |
| `CounterpartyLite` *(si aplica)* | Tercero simplificado para trazabilidad operativa. |
| `ReceivableLite` | Cuenta por cobrar simplificada. |
| `PayableLite` | Cuenta por pagar simplificada. |

## Relaciones con Core Platform (T-1204)

### Multi-tenant y scoping
- Todas las entidades del módulo deben pertenecer a `Organization`.
- Cuando aplique operación por sucursal, se permite referencia a `Branch`.

### Seguridad y permisos
- La autorización se apoya en `User`, `Role` y `Permission` de Core Platform.
- Las acciones críticas (crear, editar, aprobar, conciliar, cancelar) deben respetar permisos explícitos.

### Auditoría
- Toda acción crítica del módulo debe registrarse en `AuditLog`.

### Archivos y adjuntos
- Los comprobantes de movimientos se almacenan vía `Attachment`.
- `FinancialMovementAttachment` conserva la relación de negocio con el movimiento.

## Relación con Sync Core (T-1205)

### Entidades sincronizables en v1
- `BankAccount`: sincronizable con control de permisos (alta/edición limitada).
- `FinancialMovement`: sincronizable con control estricto por tipo de operación.
- `Transfer`: sincronizable solo cuando la transacción completa sea válida.

### Reglas de sincronización
- No se permite borrado silencioso de movimientos financieros.
- Cambios en montos/fechas de movimientos conciliados deben forzar revisión manual.
- Toda resolución de conflicto financiero debe ser auditable.

### Identidad y trazabilidad de sync
- Cada cambio sincronizado debe incluir `organizationId`, `entityId` y metadatos de origen.
- Los conflictos de entidades financieras se consideran de riesgo y requieren resolución explícita.

## Evolución hacia Accounting Core (T-1206)

### Principio de evolución
Financial Operations Core es capa operativa; Accounting Core será capa normativa y de cumplimiento.

### Estrategia de transición
- `FinancialMovement` se convierte en fuente para generación de asientos.
- `BalanceSnapshot` aporta cortes operativos, no estados contables oficiales.
- `ReceivableLite` y `PayableLite` migrarán hacia submódulos contables formales.

### Compatibilidad futura
- Mantener IDs estables y auditables para trazabilidad cruzada.
- Evitar acoplar reglas fiscales/contables en este módulo operativo.

## Regla de gobierno del módulo
Financial Operations Core es un módulo operativo-financiero de ejecución diaria. Accounting Core será el módulo normativo-contable de consolidación y cumplimiento.
