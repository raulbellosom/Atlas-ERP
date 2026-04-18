# T-0602 - Configurar módulo App base

## Metadatos
- ID: `T-0602`
- Fase: `Fase 6`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Implementar módulo raíz `AppModule` y endpoints base de disponibilidad de API.

## Alcance
- Crear `AppModule`, `AppController` y `AppService`.
- Definir endpoints base:
  - `GET /api`
  - `GET /api/health`
- Conectar imports de módulos transversales (`ApiConfigModule`, `PrismaModule`).

## Fuera de alcance
- Health checks avanzados por dependencia (`T-0609`).

## Dependencias
- `T-0601` cerrada.

## Criterios de aceptación
- [x] `AppModule` creado y enlazado desde `main.ts`.
- [x] Endpoints base responden correctamente.
- [x] Arranque de API funcional con prefijo global `api`.

## Validaciones
- `GET /api` y `GET /api/health` responden `200` en smoke test.

## Pruebas
- Ejecución `node dist/main.js` + requests HTTP locales exitosos.

## Riesgos
- Sin módulo raíz funcional no se puede integrar el resto de módulos backend.

## Documentación a actualizar
- `docs/02-architecture/37-backend-foundation-bootstrap-nestjs-prisma-config.md`
- `apps/api/src/modules/app/*`
- `apps/api/src/main.ts`

## Evidencia documental
- `apps/api/src/modules/app/app.module.ts`
- `apps/api/src/modules/app/app.controller.ts`
- `apps/api/src/modules/app/app.service.ts`
- `apps/api/src/main.ts`

## Pendientes no resueltos
- Ninguno.
