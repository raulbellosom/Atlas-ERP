---
id: T-2317
title: Tests unitarios del PostingEngineService
fase: 23
bloque: 04
status: closed
closed_at: 2026-04-19
---

## Descripción

Suite de tests unitarios para el PostingEngineService con 4 casos: creación
exitosa, idempotencia, error sin regla, y auto-creación de período fiscal.

## Criterios de aceptación

- [x] Test: creates JournalEntry when posting rule exists and no duplicate
- [x] Test: skips if JournalEntry already exists (idempotency)
- [x] Test: records posting error when no posting rule found
- [x] Test: auto-creates fiscal period when it does not exist
- [x] Todos los tests pasan con `pnpm test:unit`

## Archivo

`apps/api/src/modules/accounting/posting-engine.service.spec.ts`
