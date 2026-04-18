# T-0535 - Crear seed de feature flags iniciales

## Metadatos
- ID: `T-0535`
- Fase: `Fase 5`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear seed idempotente de feature flags foundation para activación controlada por config.

## Alcance
- Definir catálogo inicial de feature flags técnicas y operativas.
- Implementar `upsert` por `FeatureFlag.key`.
- Integrar seed al pipeline principal.

## Fuera de alcance
- Overrides por organización/usuario y UI de gestión de flags.

## Dependencias
- `T-0520` y `T-0534` cerradas.

## Criterios de aceptación
- [x] Seed de `FeatureFlag` implementado.
- [x] Integrado en `prisma/seeds/index.ts`.
- [x] Re-ejecución no duplica flags.

## Validaciones
- Conteo estable tras reseed: `feature_flags = 5`.

## Pruebas
- `db:seed` ejecutado múltiples veces sin duplicados.

## Riesgos
- Sin flags iniciales se dificulta control gradual de funcionalidades.

## Documentación a actualizar
- `docs/02-architecture/35-prisma-seeds-foundation-feature-flags-settings.md`
- `prisma/seeds/feature-flags.seed.ts`
- `prisma/seeds/index.ts`

## Evidencia documental
- `prisma/seeds/feature-flags.seed.ts`
- `prisma/seeds/index.ts`

## Pendientes no resueltos
- Ninguno.
