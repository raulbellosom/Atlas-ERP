# T-1220 - Crear seeds de datos demo del módulo

## Metadatos
- ID: `T-1220`
- Fase: `Fase 12`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar y registrar los seeds de datos demo del módulo Financial Operations Core, cubriendo todas las entidades del módulo con datos representativos del negocio. Los seeds permiten arrancar el entorno de desarrollo con un estado funcional y realista para pruebas e iteración de UI y API.

## Alcance
- Crear archivo `apps/api/prisma/seeds/financial-operations.seed.ts` con función `seedFinancialOperationsCore()`.
- El seed debe cubrir: `BankAccountType`, `BankAccount`, `CounterpartyLite`, `ReceivableLite`, `PayableLite`, `FinancialMovement` (ingreso, egreso, TRANSFER_OUT, TRANSFER_IN), `Transfer`, `FinancialMovementAttachment`, `ReconciliationSession`, `ReconciliationItem`, `BalanceSnapshot`.
- Actualizar `apps/api/prisma/seeds/index.ts` para incluir el seed financiero en el pipeline principal.
- Garantizar ejecución idempotente: las ejecuciones repetidas no crean duplicados ni fallan.

## Fuera de alcance
- No incluye datos de producción reales ni datos de clientes.
- No incluye seeds de Core Platform (ya existentes en el pipeline).
- No incluye tests automatizados de los seeds (eso se valida manualmente en esta task).

## Dependencias
- `T-1219` (migraciones): el schema debe estar migrado antes de poder insertar datos.
- `T-1218` (enums): los enums deben estar definidos para que los seeds usen valores válidos.
- Los seeds de Core Platform deben ejecutarse primero (pipeline existente) para que existan `Organization`, `User`, `Branch` y `Attachment` de referencia.

## Criterios de aceptación
- [x] Seed demo del módulo implementado e integrado en el pipeline.
- [x] `db:seed` ejecuta foundation + datos financieros demo sin error.
- [x] Ejecución repetida no rompe ni duplica de forma no controlada (idempotencia).
- [x] Las entidades del seed cubren los casos de uso principales del módulo.

## Validaciones
- `pnpm --filter @atlasrep/api run db:seed` — ejecución exitosa (primera vez).
- Segunda ejecución de `db:seed` — sin errores, sin duplicados no esperados.
- Verificación de conteos en PostgreSQL (`atlaserp_dev`): entidades demo del módulo presentes y consistentes.

## Pruebas
- Ejecutar `db:seed` en entorno limpio (base recién migrada) — debe crear todos los datos demo.
- Ejecutar `db:seed` por segunda vez — no debe crear duplicados (idempotencia).
- Verificar que los datos demo permiten navegar la UI de Financial Operations completa (cuentas, movimientos, transferencias).

## Riesgos
- **Seed no idempotente**: si el seed no verifica existencia antes de crear, la segunda ejecución duplica datos. Mitigación: usar `upsert` o verificar por campo único antes de crear.
- **Dependencia de datos de Core Platform**: si los seeds de Core Platform no se ejecutan primero, las FK a `Organization`, `User`, etc. fallan. Mitigación: el pipeline `index.ts` garantiza el orden de ejecución.
- **Attachment real no disponible**: el seed de `FinancialMovementAttachment` requiere un `Attachment` existente. Mitigación: crear un `Attachment` demo en el seed o referenciar uno creado por el seed de Core Platform.

## Documentación a actualizar
- `apps/api/prisma/seeds/financial-operations.seed.ts` — archivo nuevo.
- `apps/api/prisma/seeds/index.ts` — actualizar pipeline para incluir el nuevo seed.

## Decisiones clave
- **Idempotencia por `upsert`**: los datos demo se crean con `upsert` usando campos únicos como clave para evitar duplicados en ejecuciones repetidas.
- **Datos representativos del negocio**: el seed incluye datos de los tipos de operación más comunes (ingreso de venta, egreso de proveedor, transferencia entre cuentas) para que el entorno de desarrollo sea inmediatamente útil.

## Evidencia documental
- `apps/api/prisma/seeds/financial-operations.seed.ts`.
- `apps/api/prisma/seeds/index.ts` (actualizado).

## Pendientes para la siguiente task
- `T-1221` valida la integridad del esquema completo del módulo antes del cierre formal de Fase 12.

## Pendientes no resueltos
- Ninguno.
