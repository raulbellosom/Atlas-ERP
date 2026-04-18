# T-0240 - Congelar baseline documental v1-inicial

## Metadatos
- ID: `T-0240`
- Fase: `Fase 2`
- Bloque: `Bloque 9`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Declarar formalmente que el baseline documental v1-inicial de AtlasERP está completo y congelado. A partir de este punto, cualquier modificación a documentos de canon o blueprints aprobados requiere el proceso formal de ADR.

## Que se congela

### Canon (docs/00-canon/) — 11 documentos
- Congelados. Solo modificables via ADR de Nivel 4.

### Blueprints de dominio activos (docs/03-domain-blueprints/) — 3 documentos
- `core-platform.md`, `sync-core.md`, `financial-operations-core.md`
- Modificaciones menores (campos opcionales, aclaraciones): revisión de par.
- Modificaciones estructurales: ADR de Nivel 3.

### Blueprints técnicos (docs/03-domain-blueprints/) — 12 documentos
- Pueden evolucionar durante la implementación (Fases 3+) con revisión de par.
- Cambios que contradicen el canon: ADR de Nivel 3.

### Blueprints futuros — 6 documentos
- Son borradores, pueden cambiar libremente hasta que se inicie su blueprint técnico.

### Mapas e índices — 3 documentos
- Se actualizan automáticamente cuando se agrega un módulo nuevo aprobado.

## Declaración de congelamiento

El baseline documental `v1-inicial` de AtlasERP queda formalmente cerrado en esta fecha (2026-04-12).

Las Fases 3+ (monorepo, infraestructura, Prisma, backend, frontend) pueden iniciar sobre esta base sin esperar modificaciones documentales adicionales.

## Criterios de aceptación
- [x] Canon completo (11 documentos) verificado.
- [x] Blueprints activos aprobados (3 de dominio + 12 técnicos).
- [x] Blueprints futuros registrados (6).
- [x] Índice general de blueprints actualizado.
- [x] Catálogo maestro refleja T-0200 a T-0240 como CERRADAS.
- [x] Sin pendientes abiertos en task-pending-registry.

## Evidencia documental
- `docs/00-canon/` (11 archivos)
- `docs/03-domain-blueprints/` (21 archivos + índice)
- Este archivo de task.

## Pendientes para la siguiente fase
- Iniciar **Fase 3** (`T-0300` a `T-0346`): monorepo, paquetes base y tooling.
- Primera task: `T-0300` — Inicializar monorepo.

## Pendientes no resueltos
- Ninguno.
