# Unit Testing Skill

## ID de task origen

- `T-0132`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Guiar la creación de pruebas unitarias efectivas en AtlasERP.

## Procedimiento

### 1. Backend (NestJS + TypeScript)

- **Qué probar**: servicios, lógica de negocio, transformaciones, validaciones.
- **Qué mockear**: Prisma client, servicios externos (Redis, MinIO, mail).
- **Framework**: Jest (incluido con NestJS).

#### Estructura de test

```typescript
describe("RecursoService", () => {
  let service: RecursoService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    // Setup con mocks
  });

  describe("create", () => {
    it("debería crear un recurso válido", async () => {
      // Arrange: datos de entrada y mocks
      // Act: llamar al servicio
      // Assert: verificar resultado y efectos
    });

    it("debería fallar con datos inválidos", async () => {
      // Arrange, Act, Assert
    });
  });
});
```

#### Convenciones

- Archivo de test junto al archivo fuente: `servicio.service.spec.ts`.
- Nombres de test descriptivos en español: `'debería crear...'`, `'debería fallar...'`.
- Un `describe` por método o flujo.
- Patrón AAA (Arrange, Act, Assert) en cada test.

### 2. Frontend (React + JavaScript)

- **Qué probar**: hooks, funciones utilitarias, transformaciones.
- **Qué mockear**: llamadas a API, React Query.
- **Framework**: Vitest.

#### Convenciones

- Archivo de test junto al archivo fuente: `useRecurso.test.js`.
- Nombres descriptivos.

### 3. Validaciones compartidas

- Schemas en `packages/validation`: testear reglas de validación independientemente.

### 4. Qué NO probar con unit tests

- Controladores (mejor con integration tests).
- Componentes React completos (mejor con component tests).
- Flujos E2E.
- Funciones triviales (getters simples, mappers de 1 línea).

### 5. Restricciones

- Tests deben ser rápidos (< 50ms cada uno).
- Tests deben ser independientes (no depender de orden de ejecución).
- No hacer tests que solo verifiquen que un mock fue llamado (probar comportamiento, no implementación).

## Referencia

- `docs/07-dev-workflow/02-criterios-task-terminada.md`
- `docs/08-codex/prompts/testing-master-prompt.md`
