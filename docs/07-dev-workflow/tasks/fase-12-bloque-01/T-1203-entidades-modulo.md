# T-1203 - Definir entidades del módulo

## Metadatos
- ID: `T-1203`
- Fase: `Fase 12`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Objetivo
Definir el catálogo completo de entidades de dominio del módulo Financial Operations Core: nombre, propósito, tipo (principal/auxiliar/puente) y condición de inclusión en v1. Este catálogo es la base para las tasks de modelado de esquema (Bloque 3 de Fase 12, T-1207 a T-1214).

## Alcance
- Listar todas las entidades que componen el módulo.
- Para cada entidad: nombre oficial, propósito de negocio en una línea, tipo de entidad y si es obligatoria o condicional en v1.
- Distinguir entidades principales (BankAccount, FinancialMovement) de entidades auxiliares (BalanceSnapshot) y puente (FinancialMovementAttachment).
- Marcar entidades condicionales con "si aplica" y su condición.
- Documentar en el blueprint la tabla/lista de entidades.

## Fuera de alcance
- No incluye el diseño de los campos/columnas de cada entidad (eso es Bloque 3, T-1207 a T-1214).
- No incluye relaciones entre entidades (eso es `T-1204`).
- No crea modelos Prisma ni migraciones.
- No incluye entidades de Core Platform (Organization, User, etc.) — solo las propias del módulo.

## Dependencias
- `T-1201`: el catálogo de entidades debe soportar todas las capacidades declaradas en el alcance v1.
- `T-1202`: no deben existir entidades cuyo único propósito sea soportar capacidades excluidas.
- Core Platform (`T-0900` a `T-0923`): las entidades de módulo extienden/referencian entidades de Core Platform, no las redefinen.

## Criterios de aceptación
- [x] El blueprint contiene lista o tabla de entidades del módulo.
- [x] Cada entidad tiene propósito resumido en v1 (una línea).
- [x] Se distingue qué entidades son condicionales (`si aplica`).
- [x] El catálogo cubre todas las capacidades declaradas en `T-1201`.
- [x] No hay entidades huérfanas sin correspondencia en el alcance v1.

## Validaciones
- Verificar que cada capacidad de `T-1201` tiene al menos una entidad que la soporta.
- Revisar que los nombres de entidades siguen la nomenclatura oficial (`docs/00-canon/`, PascalCase, inglés).
- Confirmar que no hay colisión de nombres con entidades de Core Platform.
- Validar encoding UTF-8 sin mojibake.

## Pruebas
- Prueba de cobertura: mapear capacidades v1 → entidades. Toda capacidad debe tener soporte de al menos una entidad.
- Prueba de nomenclatura: todos los nombres de entidad están en PascalCase y en inglés.
- Prueba de no-redundancia: ninguna entidad está duplicada ni cumple exactamente el mismo propósito que otra.

## Riesgos
- **Entidad faltante**: si una capacidad declarada en v1 no tiene entidad de soporte, el modelado de Bloque 3 quedará incompleto. Mitigación: cruce explícito capacidades-entidades en esta task.
- **Nomenclatura inconsistente**: nombres que no sigan el estándar generan confusión en Prisma, TypeScript y documentación. Mitigación: validar contra convenciones de `docs/00-canon/02_naming_conventions.md`.

## Documentación a actualizar
- `docs/03-domain-blueprints/financial-operations-core.md` — sección "Catálogo de entidades".

## Decisiones clave
- **CounterpartyLite como entidad condicional**: se incluye para soporte de receivables/payables lite, pero sin el peso de un módulo CRM completo.
- **BalanceSnapshot como entidad auxiliar**: no es una entidad de negocio principal pero es necesaria para el cálculo y visualización de saldos sin consultas pesadas.
- **FinancialMovementAttachment como entidad puente**: relación muchos-a-muchos entre movimientos y adjuntos de Core Platform; no tiene lógica de negocio propia.

## Evidencia documental
- `docs/03-domain-blueprints/financial-operations-core.md` sección "Catálogo de entidades".

## Pendientes para la siguiente task
- `T-1204` debe definir cómo cada entidad del módulo se relaciona con las entidades de Core Platform.

## Pendientes no resueltos
- Ninguno.
