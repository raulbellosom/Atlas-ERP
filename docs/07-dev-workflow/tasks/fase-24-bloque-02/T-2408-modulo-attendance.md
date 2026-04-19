---
id: T-2408
title: Crear modulo backend Attendance
fase: 24
bloque: 02
status: closed
closed_at: 2026-04-19
---

## Descripción

Gestión de ausencias implementada via LeaveRequest: createLeaveRequest,
listLeaveRequests, reviewLeaveRequest.

## Criterios de aceptación

- [x] createLeaveRequest valida que el empleado exista
- [x] listLeaveRequests filtra por organizationId y opcionalmente por employeeId
- [x] reviewLeaveRequest valida status PENDING antes de aprobar/rechazar
- [x] Campos reviewedById y reviewedAt se actualizan al revisar

## Archivos

- `apps/api/src/modules/hr/hr.service.ts`
