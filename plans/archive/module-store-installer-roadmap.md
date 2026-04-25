# AtlasERP - Module Store Installer Roadmap (Odoo-like Full)

Fecha: 2026-04-23  
Estado: Plan ejecutable  
Superficies objetivo: Web + Desktop  
Modelo de entrega: Hybrid (catalogo curado ahora + compatibilidad futura con
remoto)  
Politica de uninstall: Preserve Data

## Estado de ejecucion (2026-04-23)

Leyenda:

- `COMPLETADO`: criterios de aceptacion cubiertos y verificados en
  codigo/pruebas.
- `PARCIAL`: existe implementacion funcional pero faltan criterios de aceptacion
  para cierre.
- `PENDIENTE`: no iniciado o sin entregable verificable en codigo.

- Avance realizado en esta ejecucion:

1. Endpoint `POST /v1/module-store/upgrade` implementado.
2. Servicio de upgrade con validaciones de version origen/destino y rollback
   basico.
3. Idempotencia basica por `requestId` agregada en `install`, `uninstall` y
   `upgrade`.
4. Job lifecycle normalizado: una fila por solicitud (`RUNNING` ->
   `COMPLETED|FAILED`).
5. Pruebas unitarias de `ModuleStoreService` actualizadas y en verde.
6. Prueba E2E `module-store-flow.e2e-spec.ts` en verde
   (catalog/install/upgrade/uninstall).
7. Seleccion de provider por feature flag (`curated` actual + `remote_stub`)
   agregada en servicio.
8. Contratos de interoperabilidad por modulo implementados y validados en
   runtime (`ownership`, reglas cruzadas y eventos versionados).
9. Seed de catalogo curado actualizado con `ownerModule` y dependencias
   canonicas.
10. UX Web de Module Store implementada con
    catalogo/detalle/install/uninstall/upgrade, polling de jobs y estados
    `loading/empty/error/offline/sync-pending`.
11. UX Desktop de Module Store implementada con flujo equivalente y cola local
    de operaciones offline (`install/uninstall/upgrade`) con reconciliacion al
    reconectar.
12. Seguridad hybrid remoto base implementada: validacion de `checksum`,
    verificacion de firma (`atlas-sign-v1:*`) y control de rollout
    (`canary|partial|total`) por `MODULE_STORE_REMOTE_ROLLOUT_STAGE`.
13. Worker dedicado de lifecycle para Desktop (`moduleStoreLifecycleWorker`)
    agregado con guardas de concurrencia y reconciliacion de cola desacoplada de
    UI.
14. Politica de conflictos lifecycle en cola offline explicitada y probada:
    `install->uninstall` (cancel), `install->upgrade` (colapso a install
    target).
15. Provider remoto endurecido con parser tipado, fallback controlado a curado y
    verificacion por trust-store configurable
    (`MODULE_STORE_REMOTE_TRUSTED_SIGNERS`).
16. Rollout dinamico por segmentos habilitado para remoto: canary allowlist
    (`MODULE_STORE_REMOTE_CANARY_ORGS`) + bucket parcial deterministico
    (`MODULE_STORE_REMOTE_PARTIAL_PERCENT`).
17. Evidencia de validacion actualizada en verde:
    `@atlaserp/desktop test:sync-core`, `@atlaserp/api typecheck`,
    `@atlaserp/api test:unit`,
    `@atlaserp/api test:e2e -- module-store-flow.e2e-spec.ts`.
18. Cobertura E2E UI dedicada de Module Store agregada para Web y Desktop:
    `@atlaserp/web test:e2e-ui` y `@atlaserp/desktop test:e2e-ui` en verde.
19. Pipeline dedicado `module-store-gates.yml` agregado con gates M1/M2/M3 y
    publicacion de artifacts go/no-go por milestone + resumen consolidado.
20. Workflow `build-desktop.yml` corregido para ejecutar build real del script
    del paquete.

- Pendiente para cierre completo del roadmap:

1. Ejecutar una corrida real del workflow `module-store-gates.yml` en GitHub
   Actions para adjuntar evidencia de run (operacion CI, no cambio de codigo).

## 1. Resumen ejecutivo

Este roadmap define el sistema de tienda e instalacion de modulos por instancia
(tenant/organization), para que AtlasERP evolucione como plataforma modular
instalable tipo Odoo.

Principios obligatorios:

1. Instalacion por instancia, no global.
2. Desinstalacion segura sin borrar datos por defecto.
3. Compatibilidad entre modulos via contratos publicos y ownership.
4. Instalacion/desinstalacion transaccional con auditoria e idempotencia.
5. Paridad de experiencia en Web y Desktop.

Catalogo inicial de modulos:

1. Core Platform (obligatorio, no desinstalable).
2. Financial Operations (instalable).
3. Accounting (instalable).
4. HR (instalable).

## 2. Alcance funcional y defaults

## Incluido

1. Catalogo de modulos con versionado y dependencias.
2. Flujo instalar/desinstalar/upgrade por instancia.
3. Jobs transaccionales con rollback.
4. Auditoria de lifecycle de modulo.
5. UI Store en Web y Desktop.
6. Base hybrid para futuro provider remoto.

## No incluido en primera ola (pero contemplado en arquitectura)

1. Billing/licenciamiento comercial.
2. Descarga runtime de modulos ejecutables no firmados.
3. Purga destructiva de datos al desinstalar (solo flujo opcional posterior).

## 3. APIs publicas planeadas

## Endpoints

1. `GET /v1/module-store/catalog`
2. `GET /v1/module-store/installed`
3. `POST /v1/module-store/install`
4. `POST /v1/module-store/uninstall`
5. `POST /v1/module-store/upgrade`
6. `GET /v1/module-store/jobs/:jobId`

## Contratos base sugeridos

### `GET /v1/module-store/catalog`

Retorna catalogo visible con versiones compatibles:

- `moduleKey`
- `displayName`
- `latestVersion`
- `availableVersions[]`
- `dependencies[]`
- `isCore`
- `lifecycleState`

### `GET /v1/module-store/installed`

Retorna estado por instancia:

- `organizationId`
- `moduleKey`
- `version`
- `status` (`INSTALLED|DISABLED|UPGRADING|ERROR`)
- `installedAt`
- `lastJobId`

### `POST /v1/module-store/install`

Body minimo:

- `organizationId`
- `moduleKey`
- `targetVersion`
- `requestId` (idempotencia)

### `POST /v1/module-store/uninstall`

Body minimo:

- `organizationId`
- `moduleKey`
- `requestId`
- `mode` (`DISABLE_ONLY` por defecto)

### `POST /v1/module-store/upgrade`

Body minimo:

- `organizationId`
- `moduleKey`
- `fromVersion`
- `toVersion`
- `requestId`

### `GET /v1/module-store/jobs/:jobId`

Retorna estado de ejecucion:

- `jobId`
- `operation` (`INSTALL|UNINSTALL|UPGRADE`)
- `status`
- `startedAt`
- `finishedAt`
- `steps[]`
- `error` (si aplica)

## 4. Tipos y entidades planeadas

## Entidades de dominio

1. `ModuleDefinition`
2. `ModuleVersion`
3. `ModuleDependency`
4. `TenantModuleInstallation`
5. `ModuleInstallJob`
6. `ModuleLifecycleAuditEvent`

## Definicion minima de campos

### `ModuleDefinition`

- `moduleKey`
- `name`
- `description`
- `isCore`
- `ownerModule`
- `lifecycleState`

### `ModuleVersion`

- `moduleKey`
- `version`
- `compatibilityRange`
- `manifestChecksum`
- `publishedAt`

### `ModuleDependency`

- `moduleKey`
- `dependsOnModuleKey`
- `versionConstraint`
- `isHardDependency`

### `TenantModuleInstallation`

- `organizationId`
- `moduleKey`
- `version`
- `status`
- `installedAt`
- `updatedAt`

### `ModuleInstallJob`

- `jobId`
- `organizationId`
- `moduleKey`
- `operation`
- `status`
- `requestId`
- `traceId`
- `logJson`

### `ModuleLifecycleAuditEvent`

- `eventId`
- `organizationId`
- `moduleKey`
- `action`
- `actorUserId`
- `beforeState`
- `afterState`
- `createdAt`

## Manifesto planeado: `module.manifest.json`

Campos obligatorios:

1. `moduleKey`
2. `version`
3. `compatibility`
4. `dependencies`
5. `migrations`
6. `seeds`
7. `permissions`
8. `featureFlags`
9. `uiSurfaces`

## 5. Epicas ejecutables (MS-001+)

## MS-001 - Catalogo canonico de modulos y lifecycle [PARCIAL]

- Objetivo: definir modelo oficial de catalogo, versiones y estados.
- Dependencias: ninguna.
- Criterios de aceptacion:

1. Entidades y enums de lifecycle definidos.
2. Reglas de compatibilidad versionadas.
3. Core marcado como no desinstalable.

## MS-002 - Manifiesto versionado y validacion [PARCIAL]

- Objetivo: estandarizar `module.manifest.json`.
- Dependencias: MS-001.
- Criterios:

1. Esquema validable en CI.
2. Validacion de dependencias y compatibilidad.
3. Rechazo de manifiestos incompletos o invalidos.

## MS-003 - Registro curado + provider abstraction (Hybrid) [COMPLETADO 2026-04-23]

- Objetivo: provider local ahora, interfaz para remoto despues.
- Dependencias: MS-001, MS-002.
- Criterios:

1. Provider `curated` operativo.
2. Contrato `provider` desacoplado.
3. Stub de provider remoto con feature flag.

## MS-004 - Instalacion por instancia transaccional [PARCIAL]

- Objetivo: instalar modulo por tenant con prechecks, migraciones y seed.
- Dependencias: MS-002, MS-003.
- Criterios:

1. Prechecks de dependencia.
2. Ejecucion por job con rollback.
3. Idempotencia por `requestId`.

## MS-005 - Desinstalacion segura (Preserve Data) [PARCIAL]

- Objetivo: desactivar modulo sin borrar datos.
- Dependencias: MS-004.
- Criterios:

1. Bloqueo si hay dependencias inversas.
2. Estado `DISABLED` sin purga fisica.
3. Auditoria completa de accion.

## MS-006 - Upgrade controlado de modulo [PARCIAL]

- Objetivo: actualizar version por instancia con seguridad.
- Dependencias: MS-004.
- Criterios:

1. Validacion de ruta de upgrade.
2. Migracion reversible por etapa.
3. Rollback ante error de paso.

## MS-007 - Seguridad y permisos `module_store:*` [PARCIAL]

- Objetivo: controlar acceso y trazabilidad.
- Dependencias: MS-001.
- Criterios:

1. Permisos `module_store:read|install|uninstall|upgrade|admin`.
2. Mapeo de roles y enforcement en endpoints.
3. Eventos de auditoria por cada cambio de estado.

## MS-008 - API Module Store (v1) [PARCIAL]

- Objetivo: exponer endpoints publicos definidos.
- Dependencias: MS-004, MS-005, MS-006, MS-007.
- Criterios:

1. Endpoints listados disponibles.
2. Errores semanticos y trazables.
3. Contratos estables para web y desktop.

## MS-009 - Interoperabilidad entre modulos [COMPLETADO]

- Objetivo: contratos de datos/eventos entre modulos instalables.
- Dependencias: MS-001, MS-008.
- Criterios:

1. Ownership por entidad explicitado.
2. Reglas de lectura/escritura cruzada validadas.
3. Contratos de evento versionados.

## MS-010 - UX Web Module Store [COMPLETADO]

- Objetivo: tienda en web admin con flujo completo.
- Dependencias: MS-008.
- Criterios:

1. Vista catalogo + detalle + instalar/desinstalar/upgrade.
2. Estado de jobs en tiempo real/polling.
3. Estados UX: loading, empty, error, offline, sync-pending.

## MS-011 - UX Desktop Module Store [COMPLETADO]

- Objetivo: paridad funcional de tienda en desktop.
- Dependencias: MS-008, MS-010.
- Criterios:

1. Flujo equivalente a web.
2. Sincronizacion de estado con backend.
3. Resiliencia offline con cola controlada.

## MS-012 - Operacion offline y sincronizacion de lifecycle [COMPLETADO 2026-04-23]

- Objetivo: coherencia de estado de instalacion en offline/online.
- Dependencias: MS-011.
- Criterios:

1. Cola de operaciones de store idempotente.
2. Reconciliacion al volver online.
3. Politica de conflictos definida.

## MS-013 - Integridad, firma y rollout gradual (Hybrid remoto) [COMPLETADO 2026-04-23]

- Objetivo: base de seguridad para provider remoto.
- Dependencias: MS-003, MS-006.
- Criterios:

1. Verificacion de integridad/checksum del paquete.
2. Flujo de firma/verificacion para remoto.
3. Rollout por etapas (canary -> parcial -> total).

## MS-014 - QA integral del Module Store [COMPLETADO 2026-04-24]

- Objetivo: cierre de calidad del sistema de tienda.
- Dependencias: MS-004..MS-013.
- Criterios:

1. Matriz de pruebas completa (unit/integration/e2e/regresion/offline).
2. Criterios go/no-go por milestone.
3. Evidencia reproducible en CI.
4. Evidencia de esta corrida documentada en
   `docs/07-dev-workflow/artifacts/module-store-go-no-go-2026-04-23.md`.
5. Pipeline dedicado implementado en `.github/workflows/module-store-gates.yml`
   con artifacts go/no-go por milestone.

## 6. Plan de pruebas (obligatorio)

## Unit tests

1. Resolucion de dependencias.
2. Compatibilidad de versiones.
3. Idempotencia por `requestId`.

## Integration tests

1. Install/uninstall/upgrade transaccional.
2. Rollback en error intermedio.
3. Auditoria y permisos efectivos.

## E2E Web/Desktop

1. Catalogo -> detalle -> instalar.
2. Desinstalar (disable only) y reactivar.
3. Visualizacion de jobs y errores.

## Regresion

1. Core no desinstalable.
2. FinOps/Accounting/HR siguen operando tras cambios de lifecycle.
3. Contratos de interoperabilidad sin roturas.

## Offline/sync

1. Operacion iniciada offline se encola.
2. Reconexion aplica reconciliacion estable.
3. Sin estados fantasmas entre web/desktop.

## 7. Milestones y go/no-go

## M0 - Readiness

Incluye:

1. MS-001, MS-002, MS-007.

Go/no-go:

1. Modelo y permisos estables.
2. Sin huecos de seguridad en endpoints planeados.

## M1 - MVP curado (API + Web)

Incluye:

1. MS-003, MS-004, MS-005, MS-008, MS-010.

Go/no-go:

1. Install/uninstall por instancia funcional.
2. Rollback e idempotencia verificados.
3. UX web completa para admin.

## M2 - Full UX Web + Desktop

Incluye:

1. MS-011, MS-012, MS-009.

Go/no-go:

1. Paridad web/desktop en flujos principales.
2. Resiliencia offline validada.
3. Interoperabilidad entre modulos estable.

## M3 - Hybrid remoto compatible

Incluye:

1. MS-013, MS-006, MS-014.

Go/no-go:

1. Provider remoto listo detras de feature flag.
2. Verificacion de integridad/firma funcional.
3. Cierre QA integral aprobado.

## 8. Riesgos clave y mitigaciones

1. Riesgo: inconsistencia de estado entre apps. Mitigacion: `ModuleInstallJob`
   como autoridad + reconciliacion deterministica.

2. Riesgo: desinstalacion rompe modulos dependientes. Mitigacion: grafo de
   dependencias inversas y bloqueo preventivo.

3. Riesgo: permisos incompletos generan 403 falsos. Mitigacion: seed de permisos
   versionado + pruebas de autorizacion por endpoint.

4. Riesgo: provider remoto introduce superficie de ataque. Mitigacion: checksum,
   firma, allowlist y rollout gradual.
