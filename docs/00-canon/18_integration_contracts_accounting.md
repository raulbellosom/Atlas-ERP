# Contratos de Integración: Financial Operations ↔ Accounting Core

**Versión:** 1.0
**Fecha:** 2026-04-18
**Task origen:** T-2204 (Fase 22 Bloque 1)

---

## Principio de diseño

Los módulos no conocen los detalles internos del otro. La comunicación es mediante **eventos de dominio** (patrón Event Bus interno) en el monolito modular. Ningún servicio de Accounting importa directamente desde el módulo FinOps y viceversa.

---

## Contrato de evento: `financial.movement.created`

**Publicado por:** `FinancialMovementsService` al crear o confirmar un `FinancialMovement`.

**DTO del evento:**

```typescript
interface FinancialPostingPayload {
  eventType: 'financial.movement.created';
  tenantId: string;
  movementId: string;
  amount: number;            // positivo = ingreso, negativo = egreso
  currency: string;          // ISO 4217 (ej. 'MXN', 'USD')
  bankAccountId: string;
  categoryCode: string;      // código de categoría del movimiento
  movementDate: Date;
  description: string;
  userId: string;            // quién originó el movimiento
}
```

**Consumido por:** `AccountingService.onFinancialMovementCreated(payload)` (cuando Accounting Core esté implementado).

---

## Contrato de evento: `transfer.completed`

**Publicado por:** `TransfersService` al confirmar una `Transfer`.

```typescript
interface TransferPostingPayload {
  eventType: 'transfer.completed';
  tenantId: string;
  transferId: string;
  amount: number;
  currency: string;
  sourceAccountId: string;
  destinationAccountId: string;
  transferDate: Date;
  userId: string;
}
```

---

## Implementación del Event Bus

En el monolito modular NestJS, el Event Bus se implementa con `@nestjs/event-emitter`:

```typescript
// Emisión (FinOps)
this.eventEmitter.emit('financial.movement.created', payload);

// Suscripción (Accounting — cuando esté implementado)
@OnEvent('financial.movement.created')
async onFinancialMovementCreated(payload: FinancialPostingPayload) {
  await this.postingEngine.process(payload);
}
```

---

## Garantías del contrato

1. **Ningún módulo accede directamente a las tablas del otro** — solo a través del evento.
2. **El evento es inmutable** — el consumidor no puede modificar el movimiento original.
3. **El evento se dispara después de que el movimiento es persistido** — no antes.
4. **Accounting puede no estar presente** — el sistema FinOps funciona sin Accounting (el evento se emite pero si no hay listener, no falla).

---

## Gestión de errores

- Si Accounting falla al procesar un evento, el `FinancialMovement` ya está persistido y no se revierte.
- Los errores de posting generan un `AccountingPostingError` log que permite reintento manual.
- La consistencia eventual es aceptable para el posting contable en v1.

---

## Referencias

- Blueprint Accounting Core: `docs/03-domain-blueprints/accounting-core-future.md`
- Estrategia de arquitectura modular: `docs/02-architecture/01-arquitectura-general.md`
- Canon de módulos: `docs/00-canon/03_modular_monolith_strategy.md`
