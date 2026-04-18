# T-1312 - Crear DTOs de PayablesLite

## Metadatos
- ID: `T-1312`
- Fase: `Fase 13`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Definir los DTOs de escritura para operaciones de cuentas por pagar simplificadas en el módulo `PayablesLite`. Estos DTOs son el contrato de entrada de los endpoints CRUD que se exponen en T-1324.

## Alcance
- Crear DTOs:
  - `CreatePayableLiteDto`: organización, contraparte (proveedor), monto, moneda, fecha de vencimiento, descripción, número de documento (opcional).
  - `UpdatePayableLiteDto`: versión parcial con todos los campos opcionales.
- Validaciones con `class-validator`:
  - Estatus: enum `PayableLiteStatus`.
  - Moneda: código ISO 4217 (3 caracteres).
  - Monto: decimal positivo.
  - Fecha de vencimiento: cadena ISO 8601.

## Fuera de alcance
- DTO de filtrado (`ListPayablesLiteQueryDto` ya creado en T-1306).
- Validación de existencia de contraparte en base de datos (lógica del servicio).
- Integración con módulo de compras/proveedores (Fase 14+).

## Dependencias
- `T-1306`: módulo `PayablesLite` creado.
- `T-1215` a `T-1218` (Fase 12): enum `PayableLiteStatus` disponible en cliente Prisma.

## Criterios de aceptación
- [x] DTOs de `PayablesLite` creados (create + update).
- [x] Validaciones de entrada definidas.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- Enviar `POST /api/v1/payables-lite` sin `amount` — debe retornar 400.
- Enviar con `dueDate` inválida — debe retornar 400.
- Enviar payload válido — debe retornar 201.

## Riesgos
- **Simetría con ReceivablesLite**: el DTO de `PayablesLite` es casi idéntico al de `ReceivablesLite`. Si los enums de estatus divergen entre sí, las validaciones deben referir correctamente a cada enum. Mitigación: importar explícitamente `PayableLiteStatus` desde `@prisma/client`.

## Documentación a actualizar
- `apps/api/src/modules/payables-lite/dto/create-payable-lite.dto.ts` — archivo nuevo.
- `apps/api/src/modules/payables-lite/dto/update-payable-lite.dto.ts` — archivo nuevo.

## Decisiones clave
- **Misma decisión que ReceivablesLite**: estatus inicial fijo (`PENDING`) y fecha de vencimiento obligatoria. Con estos DTOs se completa el conjunto de DTOs de escritura del módulo (7 módulos × 2 DTOs mínimos = 14 DTOs).

## Evidencia documental
- `apps/api/src/modules/payables-lite/dto/create-payable-lite.dto.ts`
- `apps/api/src/modules/payables-lite/dto/update-payable-lite.dto.ts`

## Pendientes para la siguiente task
- `T-1313` expande el servicio `BankAccountsService` con operaciones de escritura.

## Pendientes no resueltos
- Ninguno.
