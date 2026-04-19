---
id: T-2318
title: Tests unitarios del AccountingService
fase: 23
bloque: 04
status: closed
closed_at: 2026-04-19
---

## Descripción

Suite de tests unitarios para el AccountingService cubriendo
createChartOfAccount, getChartOfAccount y closeFiscalPeriod con sus caminos
felices y excepciones.

## Criterios de aceptación

- [x] Test: creates a new chart of account
- [x] Test: throws ConflictException if code already exists
- [x] Test: throws NotFoundException when account not found
- [x] Test: returns the account when found
- [x] Test: throws NotFoundException when period not found (closeFiscalPeriod)
- [x] Test: throws ConflictException when already closed
- [x] Test: closes an open period
- [x] Factory `chartOfAccountFactory` disponible en test-utils
- [x] Todos los tests pasan con `pnpm test:unit`

## Archivos

- `apps/api/src/modules/accounting/accounting.service.spec.ts`
- `apps/api/src/test-utils/factories/chart-of-account.factory.ts`
