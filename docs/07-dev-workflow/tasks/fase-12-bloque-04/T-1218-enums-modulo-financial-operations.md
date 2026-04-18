# T-1218 - Crear enums del módulo Financial Operations Core

## Metadatos
- ID: `T-1218`
- Fase: `Fase 12`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Consolidar y formalizar todos los enums del módulo Financial Operations Core en `schema.prisma`, reemplazando cualquier campo `String` libre por tipos enumerados fuertemente tipados. Los enums garantizan consistencia de datos, mejoran la autocompletación en TypeScript y evitan valores inválidos en la base de datos.

## Alcance
- Revisar todos los modelos del módulo (BankAccount, FinancialMovement, Transfer, ReconciliationSession, ReconciliationItem, BalanceSnapshot, CounterpartyLite, ReceivableLite, PayableLite) y confirmar que los campos de tipo y estado usan enums en lugar de `String`.
- Crear o confirmar los enums: `MovementType`, `MovementStatus`, `TransferStatus`, `ReconciliationSessionStatus`, `ReconciliationItemStatus`, `SnapshotSource`, `CounterpartyType`, `CounterpartyStatus`, `ReceivableStatus`, `PayableStatus`.
- Aplicar `@map(...)` en valores de enum para usar snake_case en la base de datos cuando sea necesario.
- Formatear el schema con `prisma format`.
- Ejecutar `prisma generate`, `typecheck` y `lint`.

## Fuera de alcance
- No incluye migración SQL (eso es `T-1219`).
- No modifica la lógica de los modelos, solo reemplaza tipos.
- No añade nuevos campos a los modelos.

## Dependencias
- `T-1209` a `T-1217`: todos los modelos del módulo deben existir para poder aplicar los enums.

## Criterios de aceptación
- [x] Todos los enums del módulo Financial Operations Core están definidos en `schema.prisma`.
- [x] `FinancialMovement`, `Transfer`, `ReconciliationSession`, `ReconciliationItem` y `BalanceSnapshot` consumen sus enums correspondientes.
- [x] `CounterpartyLite`, `ReceivableLite` y `PayableLite` consumen sus enums.
- [x] Schema Prisma validado y formateado.
- [x] `prisma generate`, `typecheck` y `lint` en verde.

## Validaciones
- Ejecutar `pnpm prisma format` para confirmar que el schema está bien formateado.
- Revisar que no quedan campos `String` donde debería haber enums (revisar los campos `type`, `status`, `source` de cada modelo).
- Confirmar que el `@map(...)` se aplica solo donde la base de datos espera valores distintos al nombre del enum.

## Pruebas
- `pnpm prisma validate` — schema válido con todos los enums.
- `pnpm prisma generate` — cliente TypeScript generado con todos los tipos de enum.
- `pnpm typecheck` en `apps/api` — los tipos de enum son accesibles y correctos en el código TypeScript.
- `pnpm lint` — sin warnings de Prisma lint.

## Riesgos
- **Campo String olvidado**: si un campo de tipo/estado queda como `String`, la base de datos acepta valores inválidos. Mitigación: revisar el schema completo con búsqueda textual de campos `type` y `status` sin enum asociado.
- **Enum con nombre conflictivo**: si un enum tiene el mismo nombre que un modelo de Core Platform, habrá colisión en el schema. Mitigación: todos los enums del módulo tienen nombres prefijados o sin conflicto con los de Core Platform.

## Documentación a actualizar
- `apps/api/prisma/schema.prisma` — consolidar y verificar todos los enums del módulo.

## Decisiones clave
- **`@map(...)` para valores en minúsculas**: se usa para que los valores en PostgreSQL sean `income`, `expense`, etc. en lugar de `INCOME`, `EXPENSE`, lo que facilita consultas SQL directas y compatibilidad con herramientas de reporting.
- **Enums separados por dominio**: no se crea un enum genérico `Status` compartido; cada modelo tiene su propio enum de estado para evitar acoplamiento implícito.

## Evidencia documental
- `apps/api/prisma/schema.prisma` — sección de enums del módulo Financial Operations Core.

## Pendientes para la siguiente task
- `T-1219` genera la migración SQL que materializa todos los cambios del Bloque 4 (T-1215 a T-1218) en la base de datos.

## Pendientes no resueltos
- Ninguno.
