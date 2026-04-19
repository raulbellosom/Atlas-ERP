---
id: T-2416
title: Crear permisos HR
fase: 24
bloque: 04
status: closed
closed_at: 2026-04-19
---

## Descripción

Permisos HR definidos y aplicados en HrController mediante
@RequireAllPermissions.

## Criterios de aceptación

- [x] hr:read — consulta de empleados, departamentos, puestos, contratos,
      ausencias
- [x] hr:write — alta/baja de empleados, contratos, solicitudes de ausencia,
      revisión
- [x] hr:admin — terminateEmployee (soft delete + TERMINATED status)
- [x] hr:payroll — reservado para Fase 30+ (nómina)
- [x] Guards aplicados en cada endpoint del HrController
