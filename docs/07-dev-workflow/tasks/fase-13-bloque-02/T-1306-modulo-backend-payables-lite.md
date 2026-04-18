# T-1306 - Crear módulo backend PayablesLite

## Metadatos
- ID: `T-1306`
- Fase: `Fase 13`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Configurar el módulo backend `PayablesLite` en NestJS para exponer consultas base de cuentas por pagar simplificadas. Con este módulo quedan creados los 7 módulos del dominio Financial Operations Core.

## Alcance
- Crear `PayablesLiteModule`, `PayablesLiteController`, `PayablesLiteService`.
- Crear `ListPayablesLiteQueryDto` con filtros de organización, contraparte, estatus y vencimiento.
- Exponer rutas:
  - `GET /api/v1/payables-lite`
  - `GET /api/v1/payables-lite/:id`
  - `GET /api/v1/payables-lite/organization/:organizationId/overdue-count`
- Integrar módulo en `AppModule`.
- Implementar consultas base con Prisma (findAll con filtros, findOneById, countOverdueByOrganization).

## Fuera de alcance
- Endpoints de creación, actualización y eliminación (eso es T-1319 y T-1324).
- DTOs de escritura (eso es T-1312).
- Integración con módulo de compras/proveedores (Fase 14+).
- Permisos y auditoría (eso es T-1331 y T-1332).

## Dependencias
- `T-1305`: `ReceivablesLiteModule` creado (mismo patrón de bloque).
- `T-1200` a `T-1222` (Fase 12): modelo Prisma `PayableLite` y enums de estatus deben estar aplicados.

## Criterios de aceptación
- [x] Módulo backend `payables-lite` creado e integrado en `AppModule`.
- [x] Consultas base y conteo de vencidos implementados con Prisma.
- [x] DTO de filtros base funcional (`ListPayablesLiteQueryDto`).
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `GET /api/v1/payables-lite` — responde con array (vacío o con datos demo).
- `GET /api/v1/payables-lite/:id` — responde con objeto o 404.
- `GET /api/v1/payables-lite/organization/:organizationId/overdue-count` — responde con número de CxP vencidas.

## Riesgos
- **Mismo riesgo de ruta que ReceivablesLite**: el segmento `organization` puede confundirse con `/:id`. Mitigación: misma solución — registrar ruta específica antes de la genérica.

## Documentación a actualizar
- `apps/api/src/app.module.ts` — importar `PayablesLiteModule`.

## Decisiones clave
- **Simetría con ReceivablesLite**: el módulo `PayablesLite` sigue exactamente el mismo patrón que `ReceivablesLite` para mantener consistencia de API y facilitar la implementación futura de módulos completos de CxC/CxP.
- **7 módulos completados**: con este módulo, todos los módulos del dominio Financial Operations Core tienen su capa de API base, habilitando el siguiente bloque de DTOs de escritura.

## Evidencia documental
- `apps/api/src/modules/payables-lite/payables-lite.module.ts`
- `apps/api/src/modules/payables-lite/payables-lite.controller.ts`
- `apps/api/src/modules/payables-lite/payables-lite.service.ts`
- `apps/api/src/modules/payables-lite/dto/list-payables-lite-query.dto.ts`

## Pendientes para la siguiente task
- `T-1307` define los DTOs de escritura para `BankAccount` (primer conjunto de DTOs del bloque).

## Pendientes no resueltos
- Ninguno.
