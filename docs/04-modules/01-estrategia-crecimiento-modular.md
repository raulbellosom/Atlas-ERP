# Estrategia de Crecimiento por Módulos

## ID de estrategia
- Task origen: `T-0017`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Estrategia oficial
AtlasERP crece por módulos con incorporación incremental, sin romper el núcleo de plataforma ni violar ownership de datos.

## Orden de evolución v1
- Core Platform (auth, users, roles/permissions, organizations, audit, settings, feature flags, attachments).
- Sync Core.
- Financial Operations Core.

## Orden de evolución posterior
- Accounting Core.
- HR Core.
- Purchases.
- Inventory.
- CRM.

## Reglas de incorporación de módulo
- Requiere blueprint funcional y técnico.
- Requiere ownership de entidades definido.
- Requiere política offline/sync del módulo.
- Requiere permisos, auditoría, pruebas y documentación.
- Requiere compatibilidad explícita con módulos existentes.

## Restricciones
- No incorporar módulos de negocio fuera de backlog governance.
- No introducir cambios estructurales sin actualización documental.

