---
id: T-2420
title: Crear pruebas HR
fase: 24
bloque: 05
status: closed
closed_at: 2026-04-19
---

## Descripción

Suite de 9 tests unitarios para HrService cubriendo departments, employees y
leave requests.

## Criterios de aceptación

- [x] Test: createDepartment exitoso
- [x] Test: createDepartment lanza ConflictException si nombre duplicado
- [x] Test: createEmployee exitoso
- [x] Test: createEmployee lanza ConflictException si employeeCode duplicado
- [x] Test: getEmployee retorna empleado con relaciones
- [x] Test: getEmployee lanza NotFoundException si no existe
- [x] Test: reviewLeaveRequest aprueba solicitud PENDING
- [x] Test: reviewLeaveRequest lanza NotFoundException si no existe
- [x] Test: reviewLeaveRequest lanza ConflictException si ya procesada
- [x] Todos los tests pasan con `pnpm test:unit`

## Archivos

- `apps/api/src/modules/hr/hr.service.spec.ts`
- `apps/api/src/test-utils/mocks/prisma.mock.ts` (mocks HR añadidos)
