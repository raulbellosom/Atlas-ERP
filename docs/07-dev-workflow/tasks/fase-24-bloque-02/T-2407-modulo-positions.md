---
id: T-2407
title: Crear modulo backend Positions
fase: 24
bloque: 02
status: closed
closed_at: 2026-04-19
---

## Descripción

HrService implementa CRUD de puestos: createPosition, listPositions (con filtro
por departmentId), getPosition.

## Criterios de aceptación

- [x] createPosition con validación de nombre único por departamento
- [x] listPositions admite filtro opcional por departmentId
- [x] getPosition lanza NotFoundException si no existe

## Archivos

- `apps/api/src/modules/hr/hr.service.ts`
