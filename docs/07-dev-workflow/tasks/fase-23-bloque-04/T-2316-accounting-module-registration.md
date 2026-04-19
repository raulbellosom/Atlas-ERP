---
id: T-2316
title: AccountingModule registration en AppModule
fase: 23
bloque: 04
status: closed
closed_at: 2026-04-19
---

## Descripción

AccountingModule y EventEmitterModule registrados en AppModule para activar el
motor contable en el arranque de la API.

## Criterios de aceptación

- [x] `EventEmitterModule.forRoot({ wildcard: false, delimiter: '.', maxListeners: 10 })`
      importado
- [x] `AccountingModule` importado y registrado en AppModule
- [x] `@nestjs/event-emitter` añadido a `apps/api/package.json`
- [x] API arranca sin errores con los nuevos módulos

## Archivos modificados

- `apps/api/src/modules/app/app.module.ts`
- `apps/api/package.json`
