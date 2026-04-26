# Contratos de Integración: HR Core ↔ Financial Operations Core

**Versión:** 1.0
**Fecha:** 2026-04-18
**Task origen:** T-2205 (Fase 22 Bloque 2)

---

## Principio de diseño

HR Core genera obligaciones de pago (nómina, finiquitos) que se convierten en `Payable` (CxP) dentro de Financial Operations Core. Ningún módulo accede directamente a las tablas del otro — solo vía eventos de dominio.

---

## Contrato de evento: `payroll.run.confirmed`

**Publicado por:** `PayrollService.confirmPayrollRun()` cuando el responsable aprueba la nómina.

```typescript
interface PayrollPayablePayload {
  eventType: 'payroll.run.confirmed';
  tenantId: string;
  payrollRunId: string;
  periodLabel: string;       // ej. "2026-04-01 - 2026-04-15"
  totalNetAmount: number;    // monto total a pagar (ya con deducciones)
  currency: string;
  paymentDueDate: Date;
  entries: {
    employeeId: string;
    netAmount: number;
    bankAccountReference?: string;  // CLABE/cuenta del empleado (opcional)
  }[];
  userId: string;
}
```

**Consumido por:** `FinancialOpsService.onPayrollConfirmed(payload)` → crea un `Payable` (CxP) global por el monto total, o uno por empleado si se requiere dispersión individual.

---

## Contrato de evento: `employment.terminated`

**Publicado por:** `HRService` al confirmar la liquidación de un empleado.

```typescript
interface TerminationPayablePayload {
  eventType: 'employment.terminated';
  tenantId: string;
  employeeId: string;
  terminationAmount: number;
  currency: string;
  paymentDueDate: Date;
  userId: string;
}
```

**Consumido por:** `FinancialOpsService.onEmployeeTermination(payload)` → crea `Payable` de finiquito.

---

## Estrategia de pago en batch

Para nóminas con muchos empleados, el `Payable` resultante se pagará mediante un **layout bancario de dispersión** (archivo CEP/SPEI batch). Este sub-módulo es parte del scope de Fase 31 y se documenta en `docs/00-canon/23_strategy_batch_payroll_payments.md`.

---

## Garantías del contrato

1. HR no accede directamente a `FinancialMovement` o `Payable` — solo emite eventos.
2. FinOps no conoce los detalles de cálculo de nómina — solo recibe el monto final a pagar.
3. Si FinOps falla al crear el `Payable`, el `PayrollRun` queda en estado `PAYABLE_PENDING` y reintenta al siguiente ciclo.
