# Forms and Validations Skill

## ID de task origen

- `T-0126`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Guiar la creación de formularios con validaciones consistentes en frontend y backend de AtlasERP.

## Procedimiento

### 1. Frontend (React + JavaScript)

- Usar librería de formularios (React Hook Form o equivalente).
- Validaciones en tiempo real con feedback visual inmediato.
- Mensajes de error claros en español de México.
- Campos requeridos marcados visualmente.
- Deshabilitar submit hasta que el formulario sea válido.
- Mostrar spinner/loading durante submit.
- Manejar errores de servidor y mostrar feedback apropiado.

### 2. Backend (NestJS + TypeScript)

- Usar DTOs con `class-validator` y `class-transformer`.
- Decorators de validación: `@IsString()`, `@IsNotEmpty()`, `@IsEmail()`, etc.
- Validation Pipe global para aplicar automáticamente.
- Mensajes de error descriptivos.
- Sanitización de entradas para prevenir inyección.

### 3. Validaciones compartidas

- Cuando una validación sea idéntica en frontend y backend, considerar extraerla a `packages/validation`.
- Schemas de validación compartidos (Zod u equivalente en `packages/validation`).

### 4. Tipos de formularios

- **Formulario de creación**: todos los campos requeridos, valores por defecto.
- **Formulario de edición**: campos prellenados, solo campos modificados en submit.
- **Formulario de filtros**: campos opcionales, applica filtros sin submit explícito o con botón.
- **Formulario inline**: edición directa en tabla o card.

### 5. Patrones de UX

- Labels claros y descriptivos.
- Placeholder como guía, no como sustituto de label.
- Agrupación lógica de campos relacionados.
- Secciones colapsibles para formularios largos.
- Prevención de pérdida de datos (warn on navigate with unsaved changes).
- Feedback de éxito con toast tras submit exitoso.

### 6. Seguridad

- Nunca confiar solo en validaciones frontend; siempre validar en backend.
- Sanitizar entradas en backend.
- No exponer IDs internos o datos sensibles en formularios sin necesidad.

## Referencia

- `docs/00-canon/05_ui_principles.md`
- `docs/00-canon/06_security_and_audit.md`
