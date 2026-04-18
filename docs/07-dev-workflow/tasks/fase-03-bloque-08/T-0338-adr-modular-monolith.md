# T-0338 - Crear ADR inicial de modular monolith

## Metadatos
- ID: `T-0338`
- Fase: `Fase 3`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `SystemArchitectAgent`

## Objetivo
Documentar la decision de arquitectura modular monolith para el backend NestJS como ADR-003.

## Criterios de aceptación
- [x] `docs/09-adr/003-modular-monolith.md` creado con estado `aprobado`.
- [x] Estructura de modulos por dominio documentada.
- [x] Comparacion con microservicios y monolito tradicional.
- [x] Reglas de separacion entre modulos (sin imports directos cross-module).
- [x] Consecuencias y posible migracion a microservicios documentada.

## Archivos creados
- `docs/09-adr/003-modular-monolith.md`

## Restricciones que establece este ADR
- Un modulo NUNCA importa directamente el Service de otro modulo.
- Comunicacion cross-module solo via eventos o interfaces definidas.
- Cada dominio de negocio tiene su propio NestJS Module en `apps/api/src/modules/`.
