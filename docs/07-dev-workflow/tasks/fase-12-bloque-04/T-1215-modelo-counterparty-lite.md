# T-1215 - Crear modelo CounterpartyLite

## Metadatos
- ID: `T-1215`
- Fase: `Fase 12`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Crear el modelo Prisma `CounterpartyLite` que representa a clientes y proveedores de forma simplificada para el módulo de tesorería v1. Es la entidad mínima necesaria para identificar el tercero involucrado en una cuenta por cobrar o pagar, sin la complejidad de un módulo CRM completo.

## Alcance
- Crear modelo `CounterpartyLite` con campos: id, organizationId, branchId, name, type (enum: CLIENT, SUPPLIER, BOTH), status (enum: ACTIVE, INACTIVE), taxId (nullable), email (nullable), phone (nullable), notes (nullable), createdById, createdAt, updatedAt, deletedAt.
- Relaciones: `Organization`, `Branch`, `User` (createdBy), backrelations a `ReceivableLite` y `PayableLite`.
- Definir índices: por `organizationId`, por `organizationId + type`, por `organizationId + taxId`.
- Ejecutar `prisma generate`, `typecheck` y `lint`.

## Fuera de alcance
- No incluye dirección, contactos múltiples ni datos de facturación avanzada (eso es CRM/ERP avanzado).
- No incluye integración con SAT ni validación de RFC/NIT.
- No incluye migración SQL (eso es `T-1219`).
- No incluye seeds (eso es `T-1220`).
- No incluye DTOs ni endpoints (eso es Fase 13).

## Dependencias
- `T-1203` (catálogo de entidades): `CounterpartyLite` fue declarada como entidad condicional en el blueprint.
- `T-1201` (alcance v1): receivables/payables lite están en el alcance de v1, lo que justifica esta entidad.

## Criterios de aceptación
- [x] Modelo `CounterpartyLite` creado en `schema.prisma`.
- [x] Relaciones y trazabilidad multi-tenant definidas.
- [x] Índices base para consulta operativa definidos.
- [x] `prisma generate`, `typecheck` y `lint` en verde.

## Validaciones
- Verificar que `taxId` es nullable (no todos los terceros tienen RFC/NIT en la fase inicial).
- Confirmar que `deletedAt` es nullable (soft-delete).
- Revisar que el enum de tipo cubre los casos CLIENT, SUPPLIER y BOTH (un tercero puede ser cliente y proveedor a la vez).

## Pruebas
- `pnpm prisma validate` — sin errores de schema.
- `pnpm prisma generate` — cliente Prisma generado con `CounterpartyLite`.
- `pnpm typecheck` — sin errores TypeScript.

## Riesgos
- **Duplicados de tercero**: sin un índice único por `taxId`, el mismo proveedor/cliente puede crearse varias veces. Mitigación: el servicio debe validar existencia por `taxId` antes de crear (no se fuerza unicidad en DB porque el campo es nullable).
- **Scope creep hacia CRM**: campos adicionales de contacto, dirección, etc. pueden ir acumulándose. Mitigación: el "Lite" en el nombre es un contrato arquitectónico — nuevos campos van a un módulo CRM futuro.

## Documentación a actualizar
- `apps/api/prisma/schema.prisma` — añadir modelo `CounterpartyLite`.

## Decisiones clave
- **"Lite" como contrato explícito**: el sufijo "Lite" en el nombre del modelo indica intencionalmente que este es un modelo simplificado temporal, distinto del futuro modelo completo de `Counterparty` que vivirá en un módulo CRM.
- **Tipo BOTH**: un tercero puede ser cliente y proveedor simultáneamente (p. ej. un distribuidor al que también se le compra). Se admite como valor de enum en lugar de manejar dos registros.

## Evidencia documental
- `apps/api/prisma/schema.prisma` — modelo `CounterpartyLite`.

## Pendientes para la siguiente task
- `T-1216` crea `ReceivableLite` que depende de `CounterpartyLite` para la relación con tercero.

## Pendientes no resueltos
- Ninguno.
