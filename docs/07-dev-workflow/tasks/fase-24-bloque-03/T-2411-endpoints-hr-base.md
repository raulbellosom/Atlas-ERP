---
id: T-2411
title: Crear endpoints HR base
fase: 24
bloque: 03
status: closed
closed_at: 2026-04-19
---

## Descripción

HrController expone todos los endpoints REST bajo `v1/hr` con guards de
permisos.

## Criterios de aceptación

- [x] POST /v1/hr/departments (hr:write)
- [x] GET /v1/hr/departments (hr:read)
- [x] GET /v1/hr/departments/:id (hr:read)
- [x] POST /v1/hr/positions (hr:write)
- [x] GET /v1/hr/positions (hr:read)
- [x] GET /v1/hr/positions/:id (hr:read)
- [x] POST /v1/hr/employees (hr:write)
- [x] GET /v1/hr/employees (hr:read)
- [x] GET /v1/hr/employees/:id (hr:read)
- [x] DELETE /v1/hr/employees/:id (hr:admin)
- [x] POST /v1/hr/contracts (hr:write)
- [x] GET /v1/hr/employees/:id/contracts (hr:read)
- [x] POST /v1/hr/leave-requests (hr:write)
- [x] GET /v1/hr/leave-requests (hr:read)
- [x] PUT /v1/hr/leave-requests/:id/review (hr:write)
- [x] GET /v1/hr/employees/:id/leave-balances (hr:read)
- [x] GET /v1/hr/employees/:id/documents (hr:read)

## Archivos

- `apps/api/src/modules/hr/hr.controller.ts`
