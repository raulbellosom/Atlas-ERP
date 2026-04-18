# T-1204 - Definir relaciones del módulo con Core Platform

## Metadatos
- ID: `T-1204`
- Fase: `Fase 12`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Objetivo
Documentar en el blueprint las relaciones explícitas entre las entidades de Financial Operations Core y las entidades de Core Platform, estableciendo cómo el módulo se apoya en la plataforma para multi-tenancy, autorización, trazabilidad de auditoría y adjuntos. Esta definición guía el modelado de esquema Prisma en Bloque 3.

## Alcance
- Definir relación con `Organization` / `Branch`: scoping multi-tenant de cuentas y movimientos.
- Definir relación con `User` / `Role` / `Permission`: autorización de operaciones financieras.
- Definir relación con `AuditLog`: qué acciones financieras deben generar entrada de auditoría.
- Definir relación con `Attachment`: cómo los movimientos referencian comprobantes digitales.
- Documentar en el blueprint con diagrama textual o tabla de relaciones.

## Fuera de alcance
- No incluye el modelado de columnas en Prisma (eso es Bloque 3).
- No incluye relaciones con Sync Core (eso es `T-1205`).
- No incluye relaciones con módulos futuros (Accounting Core, CRM).
- No define permisos específicos (eso pertenece al módulo de Roles y Permisos de Core Platform).

## Dependencias
- `T-1203`: el catálogo de entidades del módulo debe estar definido para poder declarar sus relaciones.
- Core Platform completado (`T-0900` a `T-0923`): proporciona las entidades con las que se relaciona.
- `docs/00-canon/04_data_ownership.md`: política de ownership que dicta quién puede operar sobre qué entidades.

## Criterios de aceptación
- [x] El blueprint documenta relaciones explícitas con `Organization`, `User`, `AuditLog` y `Attachment` de Core Platform.
- [x] Se establece la regla de auditoría para acciones críticas (creación, edición, eliminación de movimientos y cuentas).
- [x] Se establece el lineamiento de adjuntos de movimientos (vía `FinancialMovementAttachment` → `Attachment`).
- [x] Las relaciones están descriptas con suficiente detalle para guiar el modelado Prisma.

## Validaciones
- Revisar que las relaciones declaradas son técnicamente realizables con el esquema Prisma de Core Platform.
- Confirmar que la política de `AuditLog` para acciones financieras alinea con `docs/00-canon/` sobre auditoría.
- Verificar que la relación con `Attachment` usa el mecanismo estándar de Core Platform (no crea un mecanismo paralelo).
- Validar encoding UTF-8 sin mojibake.

## Pruebas
- Prueba de implementabilidad: las relaciones declaradas se pueden expresar directamente como relaciones Prisma en el siguiente bloque.
- Prueba de consistencia: la regla de `AuditLog` no contradice el modelo de auditoría ya implementado en Core Platform.

## Riesgos
- **Relación implícita**: dejar relaciones sin documentar puede hacer que el modelado Prisma asuma foreign keys incorrectas. Mitigación: revisar el blueprint contra el esquema Prisma de Core Platform antes de cerrar.
- **Over-coupling**: declarar dependencias de Core Platform que en realidad deberían ser opcionales o resueltas por el módulo mismo. Mitigación: aplicar principio de mínimo acoplamiento del canon.

## Documentación a actualizar
- `docs/03-domain-blueprints/financial-operations-core.md` — sección "Relaciones con Core Platform".

## Decisiones clave
- **AuditLog para toda acción destructiva y financiera crítica**: cualquier creación, modificación o eliminación de cuenta bancaria o movimiento financiero debe generar entrada en `AuditLog`. Esto se implementará en los servicios de Fase 13.
- **Adjuntos vía Attachment de Core Platform**: no se crea un modelo propio de archivo para el módulo; se reutiliza `Attachment` mediante la entidad puente `FinancialMovementAttachment`.

## Evidencia documental
- `docs/03-domain-blueprints/financial-operations-core.md` sección "Relaciones con Core Platform".

## Pendientes para la siguiente task
- `T-1205` (Bloque 2) debe definir las relaciones con Sync Core, siguiendo el mismo patrón de esta task pero para el contexto de sincronización.

## Pendientes no resueltos
- Ninguno.
