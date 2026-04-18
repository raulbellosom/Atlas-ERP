# T-0048 - Definir politica de breaking changes internas

## Metadatos
- ID: `T-0048`
- Fase: `Fase 0`
- Bloque: `Bloque 10`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir que constituye un breaking change interno, como se gestiona su introduccion controlada, como se comunica y como se protege la estabilidad del sistema durante la transicion.

## Alcance
- Definir el concepto oficial de breaking change en el proyecto.
- Definir el proceso obligatorio: identificacion, periodo de deprecacion, comunicacion, migraciones y rollback.
- Definir consideraciones especificas para breaking changes en el protocolo de sync.
- Definir restricciones de ejecucion.

## Fuera de alcance
- Cambios retrocompatibles (cubiertos en `T-0047`).
- Versionado de API publica hacia terceros.
- Estrategia de rollback de datos (cubierta en `T-0043`).

## Dependencias
- `T-0047` cerrada.
- Estrategia de restauracion (`T-0043`): el rollback de un breaking change puede requerir restore.
- Ownership de decisiones tecnicas (`T-0045`): los breaking changes de Nivel 3 requieren ADR.

## Criterios de aceptacion
- [x] Definicion oficial de breaking change documentada con ejemplos.
- [x] Proceso de 5 pasos documentado (identificacion, deprecacion, comunicacion, migraciones, rollback).
- [x] Periodo de deprecacion minimo definido por ambiente.
- [x] Consideraciones de breaking changes en sync documentadas.
- [x] Restricciones de ejecucion documentadas.

## Validaciones
- El proceso es coherente con la politica de branches y PRs (`T-0038`).
- El periodo de deprecacion es suficiente para que clientes desktop desconectados puedan actualizar.

## Pruebas
- Prueba documental: verificar que los ejemplos de breaking change son claramente distintos de los ejemplos de cambios retrocompatibles (`T-0047`).

## Riesgos
- Sin politica formal, un breaking change puede aplicarse sin periodo de deprecacion y romper clientes en produccion.
- Los clientes desktop desconectados son especialmente vulnerables a breaking changes en el protocolo de sync.

## Documentacion a actualizar
- `docs/02-architecture/17-politica-breaking-changes.md`
- `docs/02-architecture/README.md`

## Decisiones clave
- Periodo de deprecacion minimo: un sprint en staging, dos sprints en produccion.
- Breaking changes de API de sync requieren versionado del protocolo.
- Prohibido aplicar breaking changes en produccion sin plan de rollback documentado.

## Evidencia documental
- `docs/02-architecture/17-politica-breaking-changes.md`

## Pendientes para la siguiente task
- Iniciar `T-0049` (estrategia de backlog continuo).

## Pendientes no resueltos
- Ninguno.
