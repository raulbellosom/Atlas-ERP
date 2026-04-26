# Estrategia de Posting Contable desde Financial Operations Core

**Versión:** 1.0
**Fecha:** 2026-04-18
**Task origen:** T-2208 (Fase 22 Bloque 2)

---

## Decisión de diseño: Event-Driven Posting (tiempo real)

**Opción elegida:** Posting disparado por eventos de dominio, en tiempo real, con idempotencia garantizada.

**Alternativas descartadas:**
- **Batch ETL nightly**: descartado porque los estados contables deben estar disponibles en el mismo día. Dificulta conciliación intradía.
- **Stored procedures en PostgreSQL**: descartado porque acopla la lógica de negocio a la capa de datos.

---

## Flujo del posting engine

```
FinancialMovement creado
  → EventEmitter.emit('financial.movement.created', payload)
  → AccountingModule.PostingEngine.process(payload)
    → Buscar PostingRule por categoryCode
    → Construir JournalEntry (2+ líneas débito/crédito)
    → Persistir JournalEntry con idempotencyKey = movementId
    → Si ya existe una JournalEntry con ese idempotencyKey → no hacer nada (idempotencia)
```

---

## Modelo de PostingRule

```typescript
interface PostingRule {
  categoryCode: string;
  movementType: 'INCOME' | 'EXPENSE';
  debitAccountCode: string;    // cuenta contable a debitar
  creditAccountCode: string;   // cuenta contable a acreditar
  description: string;
}
```

**Ejemplos:**

| categoryCode | movementType | debitAccount | creditAccount |
|---|---|---|---|
| `SALE_INCOME` | INCOME | `1100` (Caja/Bancos) | `4100` (Ingresos por ventas) |
| `SUPPLIER_PAYMENT` | EXPENSE | `2100` (CxP) | `1100` (Caja/Bancos) |
| `PAYROLL_EXPENSE` | EXPENSE | `5100` (Gastos de nómina) | `1100` (Caja/Bancos) |

---

## Gestión de errores en el posting

1. **Fallo del PostingEngine:** El `FinancialMovement` ya está persistido — NO se revierte.
2. El error genera un registro en `AccountingPostingError` con `movementId` y `reason`.
3. Un proceso de reintento (`BullMQ`) reintenta el posting con backoff exponencial (3 intentos).
4. Si persiste el fallo, se alerta al administrador para corrección manual.

---

## Idempotencia

Cada `JournalEntry` generada por posting tiene un campo `idempotencyKey = movementId`. Si el motor intenta postear el mismo movimiento dos veces (retry, doble evento), la segunda llamada se descarta silenciosamente.

---

## Cuándo implementar

Este engine se implementa en **Fase 23** junto con el módulo de Accounting Core. Hasta entonces, los eventos `financial.movement.created` se emiten pero no tienen listener activo — el sistema funciona sin contabilidad.
