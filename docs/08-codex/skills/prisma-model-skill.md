# Prisma Model Skill

## ID de task origen

- `T-0123`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Guiar la creación y mantenimiento de modelos de Prisma en AtlasERP de forma consistente y alineada con blueprints.

## Procedimiento

### 1. Antes de agregar un modelo

- Validar que existe blueprint aprobado que lo respalde.
- Validar ownership de la entidad.
- Validar nomenclatura: modelo en `PascalCase` singular, campos en `camelCase`.

### 2. Campos base obligatorios

```prisma
model Ejemplo {
  id          String   @id @default(uuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 3. Campos condicionales

- **Multi-tenant**: `organizationId String` + relación con Organization.
- **Scoped por sucursal**: `branchId String?` + relación con Branch.
- **Auditoría de actor**: `createdBy String?`, `updatedBy String?`.
- **Soft delete**: `deletedAt DateTime?` según `docs/06-security/01-politica-soft-delete.md`.
- **Versionado**: `version Int @default(1)` según `docs/02-architecture/08-politica-versionado-registros.md`.
- **Sync**: `syncStatus SyncStatus?`, `localVersion Int?`, `serverVersion Int?`.

### 4. Relaciones

- Relaciones explícitas con `@relation`.
- Evitar relaciones polimórficas implícitas.
- Definir `onDelete` y `onUpdate` explícitamente.

### 5. Índices

- Índice en campos de búsqueda frecuente.
- Índice compuesto para combinaciones comunes.
- Unique constraints donde aplique.

### 6. Enums

- `PascalCase` para nombre, `UPPER_SNAKE_CASE` para valores.
- Enums globales en sección compartida del schema.

### 7. Migración

- Nombre descriptivo: `YYYYMMDD_descripcion_corta`.
- Verificar reversibilidad.
- Documentar impacto si es destructiva.

### 8. Post-creación

- Actualizar blueprint si el modelo abre nuevas capacidades.
- Crear/actualizar seeds si aplica.
- Registrar en índice de entidades.

## Referencia

- `docs/02-architecture/09-politica-cambios-esquema.md`
- `docs/04-modules/03-nomenclatura-entidades-tablas.md`
- `docs/06-security/01-politica-soft-delete.md`
