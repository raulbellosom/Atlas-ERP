# Canon: Estrategia de Testing

## Principios generales

- Las pruebas son parte del entregable, no una tarea adicional.
- Un módulo no está terminado si no tiene pruebas en el nivel que corresponde.
- Las pruebas deben fallar antes de la corrección y pasar después — sin trampas.
- No se mockea lo que puede probarse con la implementación real a bajo costo.

## Niveles de prueba

### Pruebas unitarias
- Prueban lógica de negocio aislada: servicios, utilidades, transformaciones.
- Sin dependencias externas reales (base de datos, HTTP).
- Deben correr rápido (< 1 segundo por suite).
- Herramienta: Jest (backend y frontend).

### Pruebas de integración
- Prueban la interacción entre capas: controlador → servicio → base de datos.
- Usan base de datos real en ambiente de test (PostgreSQL efímera).
- No mockean la base de datos: si el test pasa con mock pero falla en real, el test es inútil.
- Herramienta: Jest + Supertest (backend), Testing Library (frontend).

### Pruebas E2E
- Prueban flujos completos desde el punto de vista del usuario.
- Se ejecutan contra un ambiente de test levantado.
- Herramienta: Playwright o Cypress (a definir en Fase 6+).
- Son las más costosas: priorizar flujos críticos (login, creación de movimiento, sync).

## Cobertura mínima obligatoria

| Capa | Tipo de prueba obligatoria | Cobertura mínima |
|------|---------------------------|-----------------|
| Servicios de negocio (backend) | Unitaria | 70% |
| Endpoints críticos | Integración | Flujo completo |
| Flujos críticos de usuario | E2E | Al menos happy path |
| Módulos de sync | Integración | Todos los casos de conflicto |
| Utilidades compartidas (packages/) | Unitaria | 80% |

## Qué no tiene prueba obligatoria

- Controladores que solo delegan a servicios (se cubren con integración).
- Componentes puramente de presentación sin lógica de estado.
- Generadores de código y scripts de scaffolding.

## Datos de prueba

- Las pruebas de integración no usan datos de producción.
- Los seeds de prueba se mantienen en `prisma/seeds/` separados de los seeds de producción.
- Las pruebas limpian sus propios datos al finalizar (transacciones con rollback o truncate entre tests).

## CI/CD y pruebas

- Las pruebas unitarias y de integración corren en cada PR antes del merge.
- Las pruebas E2E corren antes del despliegue a staging.
- Un pipeline no pasa si alguna prueba falla — no se bypasea con `--force`.
