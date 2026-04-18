# Module Scaffold Skill

## ID de task origen

- `T-0121`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Guiar la creación completa de un nuevo módulo en AtlasERP, asegurando que todos los artefactos necesarios se creen de forma consistente.

## Procedimiento

### 1. Prerequisitos

- Verificar que existe blueprint aprobado del módulo.
- Verificar que existe task del backlog que justifique la creación.
- Verificar que el ownership del dominio está definido.

### 2. Backend (`apps/api/src/modules/<nombre-modulo>/`)

- `<nombre>.module.ts`: módulo NestJS con imports, controllers, providers.
- `<nombre>.controller.ts`: controlador con endpoints RESTful.
- `<nombre>.service.ts`: servicio con lógica de negocio.
- `dto/`: DTOs de entrada (create, update, filter) y salida.
- `guards/`: guards específicos del módulo si aplica.
- `<nombre>.controller.spec.ts`: tests del controlador.
- `<nombre>.service.spec.ts`: tests del servicio.

### 3. Frontend (`apps/web/src/modules/<nombre-modulo>/`)

- `routes.jsx`: definición de rutas del módulo.
- `pages/`: páginas principales (list, detail, create, edit).
- `components/`: componentes específicos del módulo.
- `services/`: funciones de llamada a API.
- `hooks/`: hooks personalizados del módulo.

### 4. Modelos de datos

- Crear/actualizar modelos en `prisma/schema.prisma`.
- Generar migración con nombre descriptivo.
- Crear seeds de datos demo.

### 5. Políticas obligatorias

- Declarar política de auditoría (qué acciones se auditan).
- Declarar política de offline/sync (qué se permite offline).
- Declarar permisos del módulo (qué roles pueden hacer qué).

### 6. Documentación

- Actualizar blueprint si cambia el alcance.
- Crear/actualizar entrada en índice de módulos.
- Documentar endpoints y modelos nuevos.

### 7. Pruebas mínimas

- Tests unitarios de servicios.
- Tests de integración de endpoints.
- Cobertura de estados UX en componentes frontend.
