---
id: T-2315
title: FiscalPeriod auto-creation en PostingEngine
fase: 23
bloque: 04
status: closed
closed_at: 2026-04-19
---

## Descripción

El PostingEngine crea automáticamente el FiscalPeriod cuando no existe para el
año/mes del movimiento, garantizando que ningún asiento contable quede sin
período fiscal asignado.

## Criterios de aceptación

- [x] `getOrCreateFiscalPeriod` busca período existente por organizationId +
      año + mes
- [x] Si no existe, lo crea con status OPEN
- [x] JournalEntry siempre tiene fiscalPeriodId válido
- [x] Test: auto-creates fiscal period when it does not exist

## Implementación

Método privado en `PostingEngineService`:

```typescript
private async getOrCreateFiscalPeriod(organizationId: string, date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const existing = await this.prisma.fiscalPeriod.findFirst({
    where: { organizationId, year, month },
  });
  if (existing) return existing;
  return this.prisma.fiscalPeriod.create({
    data: { organizationId, year, month },
  });
}
```
