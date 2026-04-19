---
id: T-2403
title: Crear migraciones HR
fase: 24
bloque: 01
status: closed
closed_at: 2026-04-19
---

## Descripción

Migration `20260419123736_hr_core` generada y aplicada con todas las tablas HR.

## Criterios de aceptación

- [x] Migration aplicada: `prisma migrate dev --name hr_core`
- [x] Tablas creadas: departments, positions, employees, contracts,
      leave_requests, leave_balances, employee_documents
- [x] Prisma Client regenerado con los nuevos tipos

## Archivos

- `prisma/migrations/20260419123736_hr_core/migration.sql`
