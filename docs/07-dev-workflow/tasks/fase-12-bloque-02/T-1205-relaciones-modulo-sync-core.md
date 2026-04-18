# T-1205 - Definir relaciones del módulo con Sync Core

## Metadatos
- ID: `T-1205`
- Fase: `Fase 12`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Objetivo
Documentar en el blueprint las políticas de integración de Financial Operations Core con Sync Core: qué entidades financieras son sincronizables, cómo se resuelven conflictos de datos financieros y cómo se garantiza la trazabilidad de identidad entre el cliente local (SQLite) y el servidor (PostgreSQL).

## Alcance
- Definir qué entidades del módulo participan en el ciclo de sincronización (BankAccount, FinancialMovement, Transfer, etc.).
- Establecer la política de resolución de conflictos para datos financieros: qué campo determina la versión ganadora.
- Documentar la estrategia de identidad: uso de UUIDs desde cliente para evitar colisiones en sync.
- Declarar qué operaciones financieras son "server-only" (no se crean offline sin confirmación posterior).
- Registrar lineamientos de trazabilidad: campos `createdAt`, `updatedAt`, `syncedAt`, `syncId` donde apliquen.

## Fuera de alcance
- No implementa código de sincronización (eso es Fase 13 en adelante, integración con servicios de Sync Core).
- No define el protocolo de red ni la frecuencia de sync.
- No relaciona el módulo con Core Platform (eso es `T-1204`).
- No crea modelos Prisma (eso es T-1207 a T-1214).

## Dependencias
- `T-1204`: las relaciones con Core Platform deben estar definidas antes de declarar cómo Sync Core accede a los datos del módulo.
- Sync Core completado (`T-0800` a `T-0840`): las políticas de sincronización son las establecidas ahí.
- `docs/00-canon/` política de resolución de conflictos: la estrategia local ≤ servidor aplica aquí.

## Criterios de aceptación
- [x] Blueprint actualizado con sección explícita de relación con Sync Core.
- [x] Reglas de sincronización y conflicto financiero documentadas.
- [x] Lineamientos de identidad/trazabilidad documentados (UUID desde cliente, campos de sync).
- [x] Las entidades sincronizables están identificadas.
- [x] Las operaciones "server-only" están declaradas explícitamente.

## Validaciones
- Revisar que las políticas de conflicto declaradas son consistentes con las políticas generales de Sync Core (`docs/00-canon/` y documentos de Fase 8).
- Confirmar que los campos de trazabilidad declarados (`syncedAt`, `syncId`) serán incluidos en los modelos Prisma del Bloque 3.
- Validar encoding UTF-8 sin mojibake.

## Pruebas
- Prueba de consistencia: las entidades declaradas como sincronizables tienen los campos de trazabilidad que Sync Core requiere (verificar contra documentación de Sync Core).
- Prueba de completitud: toda entidad de negocio del módulo tiene una política declarada (sincronizable, server-only, o no-sync).

## Riesgos
- **Política de conflicto incorrecta**: si los datos financieros siguen una política de "último en ganar", puede haber pérdida de movimientos en escenarios de sync concurrente. Mitigación: aplicar política de "servidor gana con trazabilidad" para movimientos financieros.
- **Campo de trazabilidad faltante en modelo**: si un campo de sync no se declara aquí, los modelos Prisma de T-1207 a T-1214 no lo incluirán. Mitigación: este documento es referencia obligatoria para el Bloque 3.

## Documentación a actualizar
- `docs/03-domain-blueprints/financial-operations-core.md` — sección "Relaciones con Sync Core".

## Decisiones clave
- **Movimientos financieros como "server-confirmed"**: un movimiento creado offline se marca como `PENDING` hasta que el servidor lo confirma. No se considera registrado hasta confirmación.
- **UUID desde cliente**: toda entidad del módulo se crea con UUID generado en cliente para facilitar la sincronización sin colisiones de ID.

## Evidencia documental
- `docs/03-domain-blueprints/financial-operations-core.md` sección "Relaciones con Sync Core".

## Pendientes para la siguiente task
- `T-1206` debe definir la estrategia de evolución hacia Accounting Core para completar el panorama de relaciones futuras del módulo.

## Pendientes no resueltos
- Ninguno.
