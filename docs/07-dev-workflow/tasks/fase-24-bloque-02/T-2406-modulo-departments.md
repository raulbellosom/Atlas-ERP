---
id: T-2406
title: Crear modulo backend Departments
fase: 24
bloque: 02
status: closed
closed_at: 2026-04-19
---

## Descripción

HrService implementa CRUD de departamentos: createDepartment, listDepartments,
getDepartment.

## Criterios de aceptación

- [x] createDepartment con validación de nombre único por organización
- [x] listDepartments filtra por organizationId y deletedAt null
- [x] getDepartment lanza NotFoundException si no existe

## Archivos

- `apps/api/src/modules/hr/hr.service.ts`
