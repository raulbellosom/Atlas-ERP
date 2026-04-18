# T-1305 - Crear módulo backend ReceivablesLite

## Metadatos
- ID: `T-1305`
- Fase: `Fase 13`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Configurar el módulo backend `ReceivablesLite` en NestJS para exponer consultas base de cuentas por cobrar simplificadas. Este módulo es el séptimo y último módulo del dominio Financial Operations Core en la capa de API.

## Alcance
- Crear `ReceivablesLiteModule`, `ReceivablesLiteController`, `ReceivablesLiteService`.
- Crear `ListReceivablesLiteQueryDto` con filtros de organización, contraparte, estatus y vencimiento.
- Exponer rutas:
  - `GET /api/v1/receivables-lite`
  - `GET /api/v1/receivables-lite/:id`
  - `GET /api/v1/receivables-lite/organization/:organizationId/overdue-count`
- Integrar módulo en `AppModule`.
- Implementar consultas base con Prisma (findAll con filtros, findOneById, countOverdueByOrganization).

## Fuera de alcance
- Endpoints de creación, actualización y eliminación (eso es T-1318 y T-1323).
- DTOs de escritura (eso es T-1311).
- Integración con módulo de facturación (Fase 14+).
- Permisos y auditoría (eso es T-1331 y T-1332).

## Dependencias
- `T-1300` a `T-1304` (Bloque 1): todos los módulos base del dominio creados.
- `T-1200` a `T-1222` (Fase 12): modelo Prisma `ReceivableLite` y enums de estatus deben estar aplicados.

## Criterios de aceptación
- [x] Módulo backend `receivables-lite` creado e integrado en `AppModule`.
- [x] Consultas base y conteo de vencidos implementados con Prisma.
- [x] DTO de filtros base funcional (`ListReceivablesLiteQueryDto`).
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `GET /api/v1/receivables-lite` — responde con array (vacío o con datos demo).
- `GET /api/v1/receivables-lite/:id` — responde con objeto o 404.
- `GET /api/v1/receivables-lite/organization/:organizationId/overdue-count` — responde con número de CxC vencidas.

## Riesgos
- **Ruta `/organization/:organizationId/overdue-count` vs. `/:id`**: NestJS puede confundir el segmento `organization` con un id genérico. Mitigación: registrar la ruta específica antes de `/:id` en el controlador.
- **Filtro de vencimiento requiere fecha actual del servidor**: el conteo de vencidos usa `dueDate < now()`. Mitigación: usar `new Date()` en el servicio, no en el DTO.

## Documentación a actualizar
- `apps/api/src/app.module.ts` — importar `ReceivablesLiteModule`.

## Decisiones clave
- **"Lite" como sufijo de módulo**: el sufijo refleja que este módulo gestiona cuentas por cobrar simplificadas (sin integración con facturación completa), distinguiéndolo de un futuro módulo `ReceivablesModule` completo en fases posteriores.
- **Conteo de vencidos como endpoint propio**: el conteo de CxC vencidas es un KPI frecuente en dashboards financieros, por lo que se expone como ruta dedicada.

## Evidencia documental
- `apps/api/src/modules/receivables-lite/receivables-lite.module.ts`
- `apps/api/src/modules/receivables-lite/receivables-lite.controller.ts`
- `apps/api/src/modules/receivables-lite/receivables-lite.service.ts`
- `apps/api/src/modules/receivables-lite/dto/list-receivables-lite-query.dto.ts`

## Pendientes para la siguiente task
- `T-1306` crea el módulo `PayablesLite` completando los 7 módulos del dominio.

## Pendientes no resueltos
- Ninguno.
