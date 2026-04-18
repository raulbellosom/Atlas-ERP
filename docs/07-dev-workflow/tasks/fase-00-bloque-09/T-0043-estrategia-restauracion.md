# T-0043 - Definir estrategia de restauracion minima obligatoria

## Metadatos
- ID: `T-0043`
- Fase: `Fase 0`
- Bloque: `Bloque 9`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir como se restaura el sistema ante perdida de datos o fallo critico, con objetivos de RPO/RTO, procedimientos minimos y autorizaciones requeridas.

## Alcance
- Definir objetivos RPO y RTO por ambiente.
- Definir escenarios de restauracion cubiertos.
- Definir procedimiento minimo de restauracion para PostgreSQL y MinIO.
- Definir quien autoriza y quien ejecuta restauraciones.
- Definir politica de pruebas de restauracion.

## Fuera de alcance
- Implementacion de scripts o herramientas de restore (se delega a Fase 4).
- Definicion de backup (cubierta en `T-0042`).
- Alta disponibilidad o failover automatico (tema de infra avanzada).

## Dependencias
- `T-0042` cerrada (la estrategia de backup define que hay disponible para restaurar).

## Criterios de aceptacion
- [x] RPO y RTO definidos para produccion y staging.
- [x] Escenarios de restauracion documentados.
- [x] Procedimiento minimo de restore de PostgreSQL documentado.
- [x] Procedimiento minimo de restore de MinIO documentado.
- [x] Autorizacion y roles de restauracion definidos.
- [x] Politica de pruebas de restauracion definida.

## Validaciones
- El RPO debe ser coherente con la frecuencia de backup definida en `T-0042`.
- El procedimiento de restore debe cubrir tanto restore completo como point-in-time.

## Pruebas
- Prueba documental: verificar coherencia entre frecuencia de backup y RPO.
- Prueba operativa (en implementacion): ejecutar restore de backup reciente en staging y verificar integridad.

## Riesgos
- Sin pruebas de restore, los backups pueden ser inutilizables en el momento de necesitarlos.
- Sin autorizacion clara, un restore en produccion puede ejecutarse de forma incorrecta o no autorizada.

## Documentacion a actualizar
- `docs/02-architecture/13-estrategia-restauracion.md`
- `docs/02-architecture/README.md`

## Decisiones clave
- RPO maximo de 24h para produccion.
- RTO maximo de 4h para restauracion basica en produccion.
- Restauracion en produccion requiere autorizacion explicita del responsable tecnico.
- Prueba de restore obligatoria una vez por sprint en staging.

## Evidencia documental
- `docs/02-architecture/13-estrategia-restauracion.md`

## Pendientes para la siguiente task
- Iniciar `T-0044` (estrategia de logs funcionales y tecnicos).

## Pendientes no resueltos
- Ninguno.
