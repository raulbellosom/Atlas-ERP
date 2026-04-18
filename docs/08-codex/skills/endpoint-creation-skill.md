# Endpoint Creation Skill

## ID de task origen

- `T-0124`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Guiar la creación de endpoints RESTful en el backend NestJS de AtlasERP de forma consistente.

## Procedimiento

### 1. Nomenclatura de endpoints

Seguir `docs/02-architecture/04-nomenclatura-endpoints-backend.md`:

- Base: `/api/v1/<modulo>/<recurso>`
- Plural para colecciones: `/api/v1/financial/bank-accounts`
- Singular con ID para recursos: `/api/v1/financial/bank-accounts/:id`
- Acciones especiales como sub-ruta: `/api/v1/financial/bank-accounts/:id/activate`

### 2. Métodos HTTP

- `GET` para lectura (listado y detalle).
- `POST` para creación.
- `PATCH` para actualización parcial.
- `DELETE` para eliminación (soft delete donde aplique).

### 3. Estructura del controlador

```typescript
@Controller("api/v1/<modulo>/<recurso>")
@UseGuards(AuthGuard, PermissionGuard)
export class RecursoController {
  constructor(private readonly recursoService: RecursoService) {}

  @Get()
  @RequirePermissions("recurso.list")
  findAll(@Query() filters: FilterRecursoDto) {}

  @Get(":id")
  @RequirePermissions("recurso.read")
  findOne(@Param("id") id: string) {}

  @Post()
  @RequirePermissions("recurso.create")
  create(@Body() dto: CreateRecursoDto) {}

  @Patch(":id")
  @RequirePermissions("recurso.update")
  update(@Param("id") id: string, @Body() dto: UpdateRecursoDto) {}

  @Delete(":id")
  @RequirePermissions("recurso.delete")
  remove(@Param("id") id: string) {}
}
```

### 4. DTOs obligatorios

- `CreateRecursoDto`: campos para creación con validaciones.
- `UpdateRecursoDto`: campos opcionales para actualización parcial.
- `FilterRecursoDto`: campos de filtro, paginación y ordenamiento.
- DTO de respuesta si la serialización difiere del modelo.

### 5. Respuesta estándar

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

### 6. Seguridad

- Guard de autenticación en todo endpoint (excepto health/login).
- Guard de permisos con decorator `@RequirePermissions`.
- Scoping por organización automático.
- Auditoría en operaciones de escritura.

### 7. Errores

- Usar exception filter global para formato consistente.
- Errores de validación: 400.
- No autenticado: 401.
- Sin permiso: 403.
- No encontrado: 404.
- Conflicto: 409.

## Referencia

- `docs/02-architecture/04-nomenclatura-endpoints-backend.md`
- `docs/02-architecture/06-naming-services-providers.md`
