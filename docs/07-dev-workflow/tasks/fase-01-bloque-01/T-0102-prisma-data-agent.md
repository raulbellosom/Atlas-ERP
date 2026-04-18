# T-0102 - Definir el rol del Prisma/Data Agent

## Metadatos

- ID: `T-0102`
- Fase: `Fase 1`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`

## Objetivo

Definir la responsabilidad, alcance, restricciones e interacciones del PrismaDataAgent, encargado del diseno de schema Prisma, migraciones, seeds y convenciones de datos.

## Alcance

- Definir responsabilidad del agent.
- Definir alcance y fuera de alcance.
- Definir interacciones con otros agents.
- Definir restricciones operativas.

## Fuera de alcance

- Creacion de modelos Prisma concretos (se hace en Fase 5).

## Dependencias

- `T-0100` cerrada.

## Criterios de aceptacion

- [x] Archivo del agent existe en `docs/08-codex/agents/prisma-data-agent.md`.
- [x] Contiene responsabilidad, alcance, fuera de alcance, interacciones y restricciones.
- [x] Es coherente con las politicas de nomenclatura de entidades y tablas.

## Artefacto generado

- `docs/08-codex/agents/prisma-data-agent.md`
