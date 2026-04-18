# Documentation Update Skill

## ID de task origen

- `T-0134`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Guiar la actualización de documentación al cerrar tasks o modificar el dominio/arquitectura de AtlasERP.

## Procedimiento

### 1. Cuándo actualizar documentación

- Al cerrar una task que modifica dominio, arquitectura o políticas.
- Al crear un nuevo módulo, entidad o endpoint.
- Al cambiar la estructura del monorepo.
- Al crear o modificar blueprints.
- Al tomar una decisión arquitectónica nueva (ADR).
- Al cerrar un bloque de tasks.

### 2. Qué documentos verificar

| Cambio realizado         | Documentos a revisar                                     |
| ------------------------ | -------------------------------------------------------- |
| Nuevo módulo             | Blueprint, README del módulo, índice de módulos          |
| Nueva entidad            | Blueprint, nomenclatura de entidades, schema Prisma docs |
| Nuevo endpoint           | Nomenclatura de endpoints, README del módulo backend     |
| Decisión de arquitectura | ADR en `docs/02-architecture/`, canon si es principio    |
| Cambio de política       | Documento de política afectado, README de sección        |
| Cierre de task           | Archivo de task, tablero de bloque, catálogo maestro     |
| Cierre de bloque         | Tablero de bloque, pending registry                      |

### 3. Checklist de actualización documental

- [ ] El documento afectado fue actualizado o creado.
- [ ] El README de la sección incluye la nueva entrada.
- [ ] El idioma es español de México.
- [ ] La codificación es UTF-8.
- [ ] No hay referencias a documentos que no existen.
- [ ] No hay contradicciones con documentos existentes.

### 4. Cierre de task

Al cerrar cada task:

1. Crear archivo de evidencia en `docs/07-dev-workflow/tasks/fase-XX-bloque-XX/`.
2. Actualizar tablero de bloque.
3. Actualizar catálogo maestro (marcar CERRADA).
4. Registrar pendientes en `task-pending-registry.md` si aplica.

### 5. Restricciones

- No cerrar task sin evidencia documental.
- No crear documentación fuera de la estructura oficial.
- No duplicar información entre carpetas.

## Referencia

- `docs/07-dev-workflow/01-estructura-oficial-documentacion.md`
- `docs/07-dev-workflow/02-criterios-task-terminada.md`
- `docs/07-dev-workflow/00-task-operating-model.md`
