---
id: T-2410
title: Crear modulo backend Contracts/Documents
fase: 24
bloque: 03
status: closed
closed_at: 2026-04-19
---

## Descripción

HrService gestiona contratos y documentos: createContract (desactiva el
anterior), listContracts, listDocuments.

## Criterios de aceptación

- [x] createContract desactiva contratos activos previos del empleado antes de
      crear el nuevo
- [x] listContracts retorna contratos de un empleado ordenados por startDate
      desc
- [x] listDocuments retorna documentos del empleado excluyendo soft-deleted
- [x] Contract.baseSalary como Decimal(14,2)

## Archivos

- `apps/api/src/modules/hr/hr.service.ts`
