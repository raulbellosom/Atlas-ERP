# T-1208 - Crear modelo BankAccountType

## Metadatos
- ID: `T-1208`
- Fase: `Fase 12`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Objetivo
Crear el modelo Prisma `BankAccountType` que actúa como catálogo de tipos de cuenta bancaria por organización. Provee control semántico (corriente, ahorro, inversión, etc.) y extensibilidad sin hardcodear los tipos en el schema.

## Alcance
- Crear modelo `BankAccountType` con campos: id, organizationId, code, name, description, isActive, createdAt, updatedAt.
- Definir unicidad compuesta por `organizationId + code` para evitar duplicados dentro de la misma organización.
- Establecer relación uno-a-muchos con `BankAccount` (un tipo tiene muchas cuentas).
- Establecer relación muchos-a-uno con `Organization` (scope multi-tenant).
- Ejecutar `prisma generate` y `typecheck` para validar.

## Fuera de alcance
- No incluye la migración SQL (eso es `T-1219`).
- No incluye los seeds de tipos iniciales (eso es `T-1220`).
- No incluye DTOs ni endpoints (eso es Fase 13).
- No define los valores de tipo de cuenta (Corriente, Ahorro, etc.) — eso va en seeds.

## Dependencias
- `T-1207` (`BankAccount`): el modelo `BankAccount` ya declaró la relación `accountTypeId → BankAccountType`. Esta task la completa creando el modelo referenciado.
- El modelo `Organization` existe en el schema de Core Platform.

## Criterios de aceptación
- [x] Modelo `BankAccountType` creado con campos operativos.
- [x] Regla de unicidad compuesta `organizationId + code` definida con `@@unique`.
- [x] Relación uno-a-muchos con `BankAccount` definida.
- [x] Relación con `Organization` definida.
- [x] `prisma generate` y `typecheck` en verde.

## Validaciones
- Verificar que el `@@unique([organizationId, code])` está declarado correctamente en Prisma.
- Confirmar que la relación back-reference en `BankAccount` es `accountType BankAccountType? @relation(...)`.
- Validar que el modelo permite tipos de cuenta opcionales (nullable `accountTypeId` en `BankAccount` si el catálogo no está poblado).

## Pruebas
- `pnpm prisma validate` — sin errores de schema.
- `pnpm prisma generate` — cliente Prisma generado correctamente, incluyendo `BankAccountType`.
- `pnpm typecheck` en `apps/api` — sin errores TypeScript.

## Riesgos
- **Catálogo vacío sin seeds**: si `BankAccountType` existe pero no tiene datos, las cuentas no podrán asignarse tipo. Mitigación: los seeds de `T-1220` deben incluir tipos base (Corriente, Ahorro, Inversión).
- **`accountTypeId` obligatorio vs opcional**: si se declara no-nullable, crear cuentas sin tipo fallaría antes de tener seeds. Mitigación: declarar `accountTypeId` como nullable en `BankAccount` para el arranque.

## Documentación a actualizar
- `apps/api/prisma/schema.prisma` — añadir modelo `BankAccountType`.

## Decisiones clave
- **Catálogo por organización**: los tipos de cuenta son propios de cada organización para permitir personalización. No son globales del sistema.
- **`code` como clave semántica corta**: el campo `code` (p. ej. "CORRIENTE", "AHORRO") permite referencias legibles sin depender del UUID en seeds y fixtures.

## Evidencia documental
- `apps/api/prisma/schema.prisma` — modelo `BankAccountType`.

## Pendientes para la siguiente task
- `T-1209` crea el modelo `FinancialMovement`, que depende de que `BankAccount` y `Organization` ya estén definidos.

## Pendientes no resueltos
- Ninguno.
