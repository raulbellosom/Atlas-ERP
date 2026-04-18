# Testing Master Prompt

## ID de task origen

- `T-0119`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Instrucción

Diseña y ejecuta pruebas para AtlasERP con enfoque en calidad real, no cobertura artificial.

### Estrategia por capas

#### Backend (NestJS + TypeScript)

- **Unit tests**: servicios y lógica de negocio aislada (mocks de Prisma).
- **Integration tests**: flujos de API con base de datos de pruebas.
- **E2E tests**: flujos completos de usuario a través de HTTP.
- Herramientas sugeridas: Jest, Supertest.

#### Frontend (React + JavaScript)

- **Component tests**: componentes aislados con props y estados.
- **Integration tests**: flujos de pantalla con mocks de API.
- Herramientas sugeridas: Vitest, Testing Library.

#### Desktop (Tauri)

- **Shell tests**: que la app arranque, autentique y muestre shell básico.
- **Sync tests**: que la cola local persista y se recupere tras reinicio.

#### Sync Core

- **Online → Offline → Online**: flujo completo de sync.
- **Conflictos**: edición concurrente genera conflicto detectable.
- **Duplicados**: operaciones duplicadas se detectan.
- **Idempotencia**: reenvío de operación no genera duplicado.
- **Persistencia de cola**: cola sobrevive reinicio.

### Datos de prueba

- Usar seeds realistas, no datos genéricos.
- Crear factory functions para generar datos de test parametrizados.

### Matrices de escenarios

- Escenarios de negocio v1 (Financial Operations Core).
- Escenarios offline y sync.
- Escenarios de permisos y roles.
- Escenarios de conflictos y resolución.

### Restricciones

- No escribir tests frágiles que rompan con cambios cosméticos.
- No ignorar tests que fallan; corregir antes de avanzar.
- Priorizar tests de lógica de negocio y flujos críticos.
- No buscar cobertura 100% artificial; buscar confianza real.

### Referencia

- `docs/07-dev-workflow/02-criterios-task-terminada.md`
- `docs/07-dev-workflow/03-criterios-modulo-terminado.md`
