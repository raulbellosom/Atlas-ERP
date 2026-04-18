# T-1422 - Seguridad de requests (Validadores preventivos)

## Metadatos
- ID: `T-1422`
- Fase: `Fase 14`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar una capa de validación preventiva en el frontend que garantice que los datos enviados al API son correctos antes de ejecutar la request, reduciendo errores 400 innecesarios y mejorando la experiencia del usuario con mensajes de error contextuales.

## Alcance
- Definir schemas Zod en `apps/web/src/modules/finops/schemas/` que replican las validaciones de los DTOs del backend:
  - `bankAccountSchema` — name, accountNumber, bankName, currency, balance, type.
  - `financialMovementSchema` — amount, movementDate, type, status, description.
  - `transferSchema` — fromAccountId, toAccountId (no iguales), amount, transferDate.
  - `reconciliationSessionSchema` — name, bankAccountId, periodStart, periodEnd (start < end).
  - `receivableSchema` / `payableSchema` — counterparty, amount, currency, dueDate.
- Conectar schemas con `react-hook-form` mediante `zodResolver`.
- Implementar sanitizadores de entrada en el API client:
  - `trimStrings`: elimina espacios en blanco inicial y final de todos los campos string.
  - `normalizeDecimal`: convierte comas a puntos en campos numéricos.
- Validación cruzada en `transferSchema`: `fromAccountId !== toAccountId`.

## Fuera de alcance
- Sanitización contra XSS (manejada por el backend y el propio React DOM).
- Validación de permisos en frontend (ya cubierto por T-1332 y el interceptor global).
- CSRF tokens (manejado por el interceptor global del API client).

## Dependencias
- `T-1401` a `T-1418`: formularios implementados listos para conectar schemas.
- Zod ya instalado como dependencia del workspace (`apps/web`).

## Criterios de aceptación
- [x] Schemas Zod creados para todos los formularios del módulo.
- [x] `zodResolver` conectado en todos los formularios.
- [x] Sanitizadores `trimStrings` y `normalizeDecimal` activos en el API client.
- [x] Validación cruzada de `fromAccountId !== toAccountId` en el wizard de transferencias.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: intentar guardar formulario vacío → todos los errores de campo visibles antes de enviar al API.

## Pruebas
- Crear cuenta bancaria sin nombre → error inline "El nombre es requerido" antes de llamar al API.
- Crear transferencia con misma cuenta de origen y destino → error inline "Las cuentas deben ser diferentes".
- Ingresar monto con coma ("1.234,56") → normalizado a 1234.56 antes de enviar.
- Ingresar nombre con espacios al inicio ("  Cuenta ") → trimmed a "Cuenta" al enviar.
- Periodo de conciliación con `periodEnd < periodStart` → error "La fecha de fin debe ser posterior al inicio".

## Riesgos
- **Desincronización schema frontend/backend**: si el backend actualiza un DTO sin actualizar el schema Zod del frontend, puede haber validaciones inconsistentes. Mitigación: los schemas Zod están en el mismo monorepo y deben actualizarse en la misma PR que los DTOs.

## Documentación a actualizar
- `apps/web/src/modules/finops/schemas/bankAccountSchema.js` — archivo nuevo.
- `apps/web/src/modules/finops/schemas/financialMovementSchema.js` — archivo nuevo.
- `apps/web/src/modules/finops/schemas/transferSchema.js` — archivo nuevo.
- `apps/web/src/modules/finops/schemas/reconciliationSchema.js` — archivo nuevo.
- `apps/web/src/modules/finops/schemas/receivableSchema.js` — archivo nuevo.
- `apps/web/src/modules/finops/schemas/payableSchema.js` — archivo nuevo.

## Decisiones clave
- **Schemas a nivel de módulo, no compartidos globalmente**: cada módulo mantiene sus propios schemas para evitar dependencias cruzadas. Si en el futuro se reutilizan, se moverán a un paquete `@atlasrep/schemas`.
- **Sanitizadores en el API client, no en los formularios**: centralizar la sanitización en el cliente HTTP garantiza que ningún request salga sin limpiar, independientemente del formulario que lo originó.

## Evidencia documental
- `apps/web/src/modules/finops/schemas/bankAccountSchema.js`
- `apps/web/src/modules/finops/schemas/financialMovementSchema.js`
- `apps/web/src/modules/finops/schemas/transferSchema.js`
- `apps/web/src/modules/finops/schemas/reconciliationSchema.js`
- `apps/web/src/modules/finops/schemas/receivableSchema.js`
- `apps/web/src/modules/finops/schemas/payableSchema.js`

## Pendientes para la siguiente task
- `T-1423` (Bloque 6) audita y refina la accesibilidad y el linting del módulo completo.

## Pendientes no resueltos
- Ninguno.
