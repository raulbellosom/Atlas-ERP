---
id: T-2418
title: Crear integracion con Financial Ops si aplica
fase: 24
bloque: 04
status: closed
closed_at: 2026-04-19
---

## Descripción

La integración HR → Financial Ops (pago de nómina genera FinancialMovement) está
definida en el contrato de integración pero se implementa en Fase 30 con
PayrollRun.

## Criterios de aceptación

- [x] Contrato de integración documentado en
      `docs/00-canon/19_integration_contracts_hr_finops.md`
- [x] Integración técnica diferida: requiere PayrollRun (Fase 30)
- [x] Al confirmar PayrollRun → FinancialMovement egreso (diseño acordado, no
      implementado en Fase 24)
