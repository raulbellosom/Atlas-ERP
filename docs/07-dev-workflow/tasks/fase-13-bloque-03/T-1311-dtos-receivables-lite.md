# T-1311 - Crear DTOs de ReceivablesLite

## Metadatos
- ID: `T-1311`
- Fase: `Fase 13`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Definir los DTOs de escritura para operaciones de cuentas por cobrar simplificadas en el módulo `ReceivablesLite`. Estos DTOs son el contrato de entrada de los endpoints CRUD que se exponen en T-1323.

## Alcance
- Crear DTOs:
  - `CreateReceivableLiteDto`: organización, contraparte, monto, moneda, fecha de vencimiento, descripción, número de documento (opcional).
  - `UpdateReceivableLiteDto`: versión parcial con todos los campos opcionales.
- Validaciones con `class-validator`:
  - Estatus: enum `ReceivableLiteStatus`.
  - Moneda: código ISO 4217 (3 caracteres).
  - Monto: decimal positivo.
  - Fecha de vencimiento: cadena ISO 8601.
  - Número de documento: string opcional, longitud máxima.

## Fuera de alcance
- DTO de filtrado (`ListReceivablesLiteQueryDto` ya creado en T-1305).
- Validación de existencia de contraparte en base de datos (lógica del servicio).
- Integración con módulo de facturación (Fase 14+).

## Dependencias
- `T-1305`: módulo `ReceivablesLite` creado.
- `T-1215` a `T-1218` (Fase 12): enum `ReceivableLiteStatus` disponible en cliente Prisma.

## Criterios de aceptación
- [x] DTOs de `ReceivablesLite` creados (create + update).
- [x] Validaciones de entrada definidas.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- Enviar `POST /api/v1/receivables-lite` sin `amount` — debe retornar 400.
- Enviar con `currencyCode: "MXN_INVALIDO"` — debe retornar 400.
- Enviar con `dueDate` que no es fecha — debe retornar 400.
- Enviar payload válido — debe retornar 201.

## Riesgos
- **Contraparte como referencia libre**: `CounterpartyLite` es una entidad del mismo módulo. El DTO acepta `counterpartyId` como UUID, pero la validación de existencia es del servicio.

## Documentación a actualizar
- `apps/api/src/modules/receivables-lite/dto/create-receivable-lite.dto.ts` — archivo nuevo.
- `apps/api/src/modules/receivables-lite/dto/update-receivable-lite.dto.ts` — archivo nuevo.

## Decisiones clave
- **Estatus inicial fijo**: al crear una CxC, el estatus siempre es `PENDING`. El DTO no permite especificar estatus en creación para evitar inconsistencias.
- **Fecha de vencimiento obligatoria**: una CxC sin fecha de vencimiento no puede incluirse en el conteo de vencidos ni en dashboards financieros, por lo que es campo requerido.

## Evidencia documental
- `apps/api/src/modules/receivables-lite/dto/create-receivable-lite.dto.ts`
- `apps/api/src/modules/receivables-lite/dto/update-receivable-lite.dto.ts`

## Pendientes para la siguiente task
- `T-1312` define los DTOs de `PayablesLite`.

## Pendientes no resueltos
- Ninguno.
