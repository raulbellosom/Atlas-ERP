---
id: T-2402
title: Crear modelos HR en Prisma
fase: 24
bloque: 01
status: closed
closed_at: 2026-04-19
---

## Descripción

Adición de los 7 modelos HR al schema.prisma con enums, índices, relaciones con
Organization y relaciones entre entidades.

## Criterios de aceptación

- [x] 4 enums nuevos: EmploymentStatus, ContractType, LeaveType,
      LeaveRequestStatus
- [x] 7 modelos: Department, Position, Employee, Contract, LeaveRequest,
      LeaveBalance, EmployeeDocument
- [x] Organization tiene relaciones a todas las entidades HR
- [x] `prisma validate` pasa sin errores

## Archivos

- `prisma/schema.prisma`
