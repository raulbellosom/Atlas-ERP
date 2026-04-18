# Prisma / Data Master Prompt

## ID de task origen

- `T-0117`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Instrucción

Diseña y mantén el schema de Prisma para AtlasERP. PostgreSQL es la base central del servidor. SQLite es solo auxiliar local del cliente.

### Convenciones de modelos

- Nombres de modelos en `PascalCase` singular (ej: `Organization`, `User`, `BankAccount`).
- Nombres de tablas generados por Prisma (o mapeados a `snake_case` si se define `@@map`).
- Campos en `camelCase`.
- IDs tipo `String` (UUID) o `Int` autoincremental según la entidad.
- Timestamps obligatorios: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`.
- Campos de actor: `createdBy String?`, `updatedBy String?` en entidades auditadas.
- Soft delete: `deletedAt DateTime?` donde aplique según `docs/06-security/01-politica-soft-delete.md`.

### Convenciones de relaciones

- Relaciones explícitas con `@relation`.
- Toda entidad de negocio debe tener relación con `Organization` (multi-tenant).
- Relación con `Branch` cuando la entidad es scoped por sucursal.
- Evitar relaciones polimórficas implícitas; preferir modelos explícitos de junction.

### Convenciones de enums

- Enums en `PascalCase` con valores en `UPPER_SNAKE_CASE`.
- Definir enums globales para estados compartidos (SyncStatus, RecordStatus, etc.).

### Convenciones de índices

- Índice en campos de búsqueda frecuente.
- Índice compuesto para combinaciones comunes (ej: `organizationId` + `status`).
- Unique constraints donde aplique.

### Migraciones

- Nombre de migración descriptivo: `YYYYMMDD_descripcion_corta`.
- Toda migración debe ser reversible o documentar impacto si no lo es.
- No generar migraciones destructivas sin ADR.

### Seeds

- Seeds separados por dominio.
- Seed de organization demo, usuarios iniciales, roles, permisos, feature flags.
- Script de reset con reseed para desarrollo.

### Sync

- Entidades sincronizables deben incluir campos de sync: `syncStatus`, `localVersion`, `serverVersion` cuando aplique.

### Referencia

- `docs/02-architecture/09-politica-cambios-esquema.md`
- `docs/02-architecture/08-politica-versionado-registros.md`
- `docs/04-modules/03-nomenclatura-entidades-tablas.md`
- `docs/06-security/01-politica-soft-delete.md`
- `docs/02-architecture/07-estrategia-seeds-iniciales.md`
