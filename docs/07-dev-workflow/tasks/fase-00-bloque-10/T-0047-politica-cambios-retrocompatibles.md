# T-0047 - Definir politica de cambios retrocompatibles

## Metadatos
- ID: `T-0047`
- Fase: `Fase 0`
- Bloque: `Bloque 10`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir que es un cambio retrocompatible, cuando aplica y como se gestiona para que los modulos, clientes y consumidores existentes no se rompan al aplicarlo.

## Alcance
- Definir el concepto oficial de retrocompatibilidad en el proyecto.
- Listar ejemplos de cambios retrocompatibles vs no retrocompatibles.
- Definir el proceso y nivel de revision requerido.
- Definir consideraciones especificas para migraciones de base de datos y sync.

## Fuera de alcance
- Breaking changes (cubiertos en `T-0048`).
- Versionado de API publica hacia terceros (el proyecto no tiene API publica en v1).
- Semver formal de paquetes internos (se define en Fase 3).

## Dependencias
- `T-0046` cerrada.
- Politica de ownership de decisiones tecnicas (`T-0045`): define el nivel de revision requerido.

## Criterios de aceptacion
- [x] Definicion oficial de retrocompatibilidad documentada.
- [x] Ejemplos concretos de cambios retrocompatibles documentados.
- [x] Proceso y nivel de revision definido.
- [x] Consideraciones de migraciones de BD documentadas.
- [x] Consideraciones de sync documentadas.
- [x] Restricciones documentadas.

## Validaciones
- La definicion es coherente con la politica de breaking changes (`T-0048`).
- Las consideraciones de sync son coherentes con el blueprint de Sync Core.

## Pruebas
- Prueba documental: los ejemplos son claros y no ambiguos respecto a la definicion.

## Riesgos
- Sin definicion clara, los desarrolladores pueden asumir que un cambio es retrocompatible cuando no lo es, rompiendo consumidores silenciosamente.

## Documentacion a actualizar
- `docs/02-architecture/16-politica-cambios-retrocompatibles.md`
- `docs/02-architecture/README.md`

## Decisiones clave
- Un cambio retrocompatible requiere revision de par (Nivel 2), no ADR.
- En contexto de sync, el servidor debe poder responder a clientes con version anterior por al menos un ciclo de release.
- No es seguro asumir retrocompatibilidad en campos de fecha o enum sin verificar consumidores.

## Evidencia documental
- `docs/02-architecture/16-politica-cambios-retrocompatibles.md`

## Pendientes para la siguiente task
- Iniciar `T-0048` (politica de breaking changes internas).

## Pendientes no resueltos
- Ninguno.
