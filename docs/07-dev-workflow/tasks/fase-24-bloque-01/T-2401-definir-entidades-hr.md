---
id: T-2401
title: Definir entidades de HR
fase: 24
bloque: 01
status: closed
closed_at: 2026-04-19
---

## Descripción

Definición de las 7 entidades del módulo HR con sus relaciones, enums y campos
clave.

## Criterios de aceptación

- [x] Entidades: Employee, Department, Position, Contract, LeaveRequest,
      LeaveBalance, EmployeeDocument
- [x] Enums: EmploymentStatus, ContractType, LeaveType, LeaveRequestStatus
- [x] Relaciones: Employee → Department, Position, Contract[], LeaveRequest[],
      LeaveBalance[], EmployeeDocument[]
- [x] Campos CURP, RFC, employeeCode con restricciones de unicidad
