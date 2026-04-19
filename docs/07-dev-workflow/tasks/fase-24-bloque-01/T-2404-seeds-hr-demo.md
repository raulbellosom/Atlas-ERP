---
id: T-2404
title: Crear seeds HR demo
fase: 24
bloque: 01
status: closed
closed_at: 2026-04-19
---

## Descripción

Seed `hr.seed.ts` crea 5 departamentos, 8 puestos, 3 empleados demo con
contratos y saldos de vacaciones.

## Criterios de aceptación

- [x] 5 departamentos: Administración, Ventas, Operaciones, Tecnología, Recursos
      Humanos
- [x] 8 puestos distribuidos entre departamentos
- [x] 3 empleados con contrato PERMANENT y LeaveBalance de vacaciones 2026
- [x] Seed idempotente (upsert/findFirst)

## Archivos

- `prisma/seeds/hr.seed.ts`
- `prisma/seeds/index.ts` (seedHr añadido)
