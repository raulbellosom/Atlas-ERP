# T-0520 - Crear modelo FeatureFlag

## Metadatos
- ID: `T-0520`
- Fase: `Fase 5`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear el modelo `FeatureFlag` para control de funcionalidades sin despliegue.

## Alcance
- Definir `key`, `description`, `defaultValue`, `isActive`.
- Definir unicidad global por `key`.
- Definir índices base de consulta.

## Fuera de alcance
- Overrides por organización/usuario (modelo futuro).

## Dependencias
- `T-0519` cerrada.

## Criterios de aceptación
- [x] Modelo `FeatureFlag` implementado.
- [x] Unicidad en `key` implementada.
- [x] Alineación con blueprint de feature flags.

## Validaciones
- `prisma validate` sin errores.

## Pruebas
- `db:generate` y `db:seed` exitosos.

## Riesgos
- Sin feature flags, activaciones graduales requieren deploy completo.

## Documentación a actualizar
- `docs/02-architecture/32-prisma-modelos-foundation-featureflags-sync.md`
- `prisma/schema.prisma`

## Evidencia documental
- `prisma/schema.prisma`

## Pendientes no resueltos
- Ninguno.
