# T-0505 - Definir convenciones de timestamps

## Metadatos
- ID: `T-0505`
- Fase: `Fase 5`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Establecer convención oficial de timestamps para todos los modelos Prisma.

## Alcance
- Definir campos base obligatorios.
- Definir campos condicionales por dominio.
- Definir reglas operativas de uso.

## Fuera de alcance
- Implementación de timestamps por modelo específico (`T-0510+`).

## Dependencias
- `T-0504` cerrada.

## Criterios de aceptación
- [x] Convención documentada en arquitectura.
- [x] Alineación con herramientas de `docs/08-codex`.

## Validaciones
- Consistencia con `prisma-data-agent` y prompt maestro Prisma.

## Pruebas
- Revisión documental cruzada de convenciones.

## Riesgos
- Sin convención uniforme se pierde trazabilidad temporal de registros.

## Documentación a actualizar
- `docs/02-architecture/25-prisma-convenciones-timestamps.md`

## Evidencia documental
- `docs/02-architecture/25-prisma-convenciones-timestamps.md`

## Pendientes no resueltos
- Ninguno.
