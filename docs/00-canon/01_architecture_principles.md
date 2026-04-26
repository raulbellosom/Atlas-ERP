# Architecture Principles

## Carácter no negociable
Estos principios son obligatorios para cualquier decisión técnica de AtlasERP durante v1.

1. Arquitectura modular monolítica al inicio.
2. El servidor es la fuente oficial de verdad.
3. PostgreSQL es la base central.
4. SQLite solo se usa localmente para caché, borradores y sync controlado.
5. El frontend web y el desktop comparten contratos de dominio y sync.
6. Ningún módulo nuevo nace sin blueprint.
7. Toda operación crítica debe dejar auditoría.
8. No se implementa offline total; solo offline controlado.
9. Toda sincronización con diferencias debe poder revisarse manualmente.
10. Preferir evolución incremental sobre microservicios tempranos.

## Criterio de cumplimiento
Una implementación se considera válida solo si respeta los 10 principios sin excepción no documentada.

## Referencias de convención
- `docs/02-architecture/04-nomenclatura-endpoints-backend.md`
- `docs/02-architecture/06-naming-services-providers.md`
- `docs/02-architecture/07-estrategia-seeds-iniciales.md`
- `docs/02-architecture/08-politica-versionado-registros.md`
- `docs/02-architecture/09-politica-cambios-esquema.md`

