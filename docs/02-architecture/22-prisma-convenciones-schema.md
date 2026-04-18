# Convenciones del Schema Prisma

## Task de origen
- `T-0502`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Convenciones base
- Nombre de modelos en `PascalCase` singular (`Organization`, `User`, `AuditLog`).
- Nombre de campos en `camelCase`.
- Tablas físicas en `snake_case` usando `@@map` cuando aplique.
- PK estándar `id String @id @default(cuid())` salvo excepción justificada.
- Campos temporales estándar por entidad:
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`

## Gobernanza
- Todo modelo nuevo debe incluir justificación de dominio y relaciones explícitas.
- No introducir campos ambiguos sin contexto funcional.
