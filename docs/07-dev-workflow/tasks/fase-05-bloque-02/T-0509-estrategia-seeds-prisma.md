# T-0509 - Definir estrategia de seeds

## Metadatos
- ID: `T-0509`
- Fase: `Fase 5`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Definir estrategia operativa de seeds Prisma y dejar orquestador actualizado para bloques siguientes.

## Alcance
- Definir estructura y orden de seeds.
- Definir reglas de idempotencia y seguridad.
- Actualizar `prisma/seeds/index.ts` como orquestador base.
- Asegurar compatibilidad de ejecución de seed en Node 22 (`tsx`).

## Fuera de alcance
- Crear seeds de entidades concretas (`T-0531+`).

## Dependencias
- `T-0508` cerrada.

## Criterios de aceptación
- [x] Estrategia de seeds documentada.
- [x] Orquestador de seeds actualizado.
- [x] Preparación para módulos de seeds por dominio definida.

## Validaciones
- Alineación con estrategia inicial de seeds y recursos de `docs/08-codex`.

## Pruebas
- `pnpm --filter @atlasrep/api run db:seed` ejecutado sin errores.

## Riesgos
- Sin estrategia clara, seeds pueden romper entornos o perder idempotencia.

## Documentación a actualizar
- `docs/02-architecture/29-prisma-estrategia-seeds.md`
- `prisma/seeds/index.ts`
- `apps/api/package.json`

## Evidencia documental
- `docs/02-architecture/29-prisma-estrategia-seeds.md`
- `prisma/seeds/index.ts`
- `apps/api/package.json`

## Pendientes no resueltos
- Ninguno.
