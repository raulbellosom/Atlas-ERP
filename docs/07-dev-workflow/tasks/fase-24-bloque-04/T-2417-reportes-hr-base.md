---
id: T-2417
title: Crear reportes HR base
fase: 24
bloque: 04
status: closed
closed_at: 2026-04-19
---

## Descripción

Reportes HR base disponibles via endpoints existentes con filtros. Reportes
dedicados diferidos a Fase 30+.

## Criterios de aceptación

- [x] GET /v1/hr/employees?status=ACTIVE retorna empleados activos
- [x] GET /v1/hr/employees?departmentId=X retorna empleados por departamento
- [x] GET /v1/hr/leave-requests?organizationId=X retorna todas las ausencias
- [x] Reportes avanzados (nómina, headcount histórico) diferidos a Fase 30+
