# Accounting Core Blueprint (Refinado post-v1)

**Versión:** 2.0
**Fecha refinamiento:** 2026-04-18
**Task origen:** T-2200

---

## Propósito

Convertir operaciones financieras en contabilidad formal: plan de cuentas, asientos (posting), balance de comprobación, cierre mensual y cumplimiento fiscal.

---

## Entidades

| Entidad | Descripción | Sync offline |
|---------|-------------|--------------|
| `ChartOfAccount` | Catálogo de cuentas contables (código + nombre + tipo) | Sí (caché) |
| `JournalEntry` | Póliza contable (agrupación de líneas de débito/crédito) | No (solo servidor) |
| `JournalEntryLine` | Línea individual: cuenta + monto + débito/crédito | No |
| `LedgerBalance` | Saldo acumulado por cuenta al final de cada período | No |
| `TrialBalance` | Balance de comprobación por período (snapshot) | No |
| `PostingRule` | Regla que mapea tipo de movimiento → asiento contable | Sí (caché) |
| `FiscalPeriod` | Período contable (mes/año) con estado abierto/cerrado | Sí (caché) |

---

## Políticas del módulo (siguiendo patrones de v1)

### Auditoría
- Toda creación/modificación de `JournalEntry` genera `AuditLog` con `userId`, `deviceId`, `tenantId`.
- Las `JournalEntry` son inmutables una vez confirmadas. Las correcciones se hacen con asiento inverso.

### Permisos
- `accounting:read` — consulta de cuentas, asientos y balances.
- `accounting:write` — crear/confirmar asientos y cerrar períodos.
- `accounting:admin` — modificar catálogo de cuentas y reglas de posting.

### Sync
- `ChartOfAccount` y `PostingRule` se sincronizan al desktop como catálogos de solo lectura.
- `JournalEntry` no se crean offline — requieren validación del servidor en tiempo real.

### Relación con Financial Operations Core
- Los movimientos financieros (FinancialMovement, Transfer) disparan eventos que generan JournalEntries automáticamente vía `PostingRule`.
- El contrato de integración está definido en `docs/00-canon/18_integration_contracts_accounting.md`.

---

## Fases de implementación proyectadas

1. **Fase 23** — Modelos Prisma + módulo NestJS base + CRUD `ChartOfAccount`
2. **Fase 24** — Motor de posting: `PostingRule` + generación automática desde FinOps events
3. **Fase 25** — Cierre de período + `TrialBalance` + exportación fiscal
