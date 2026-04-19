---
id: T-2405
title: Crear modulo backend Employees
fase: 24
bloque: 02
status: closed
closed_at: 2026-04-19
---

## Descripción

HrService implementa CRUD completo de empleados: createEmployee, listEmployees,
getEmployee, terminateEmployee.

## Criterios de aceptación

- [x] createEmployee con validación de employeeCode único
- [x] listEmployees con filtros por departmentId, positionId, status, limit
- [x] getEmployee incluye department, position y contracts
- [x] terminateEmployee aplica soft delete + status TERMINATED + auditoría

## Archivos

- `apps/api/src/modules/hr/hr.service.ts`
