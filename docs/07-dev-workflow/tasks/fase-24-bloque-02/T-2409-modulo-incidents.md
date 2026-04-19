---
id: T-2409
title: Crear modulo backend Incidents
fase: 24
bloque: 02
status: closed
closed_at: 2026-04-19
---

## Descripción

Incidencias gestionadas mediante LeaveRequest con tipos específicos (SICK,
PERSONAL). Modelo unificado cubre ausencias e incidencias en Fase 24.

## Criterios de aceptación

- [x] LeaveType incluye: VACATION, SICK, PERSONAL, MATERNITY, PATERNITY, UNPAID
- [x] listLeaveRequests permite filtrar por employeeId para ver todas sus
      incidencias/ausencias
- [x] Modelo cubre casos de incidencias como ausencias no planeadas (SICK,
      PERSONAL)
