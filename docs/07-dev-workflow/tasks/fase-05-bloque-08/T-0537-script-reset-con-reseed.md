# T-0537 - Crear script de reset con reseed

## Metadatos
- ID: `T-0537`
- Fase: `Fase 5`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear un script operativo para resetear la base de datos foundation y re-ejecutar seeds en una sola acción segura.

## Alcance
- Crear `tools/reset-db-reseed.sh` con confirmación explícita.
- Añadir script raíz `db:reset:reseed` en `package.json`.
- Verificar compatibilidad en entorno Windows + bash.
- Corregir `tools/reset-local.sh` para credenciales actuales de PostgreSQL y compatibilidad de input.

## Fuera de alcance
- Resets de infraestructura remota (staging/prod).

## Dependencias
- `T-0530` a `T-0536` cerradas.

## Criterios de aceptación
- [x] Script de reset con reseed creado.
- [x] Script probado con ejecución real end-to-end.
- [x] Resetea schema, migra y seed sin intervención manual adicional.

## Validaciones
- `echo si | bash tools/reset-db-reseed.sh` exitoso.
- `db:migrate:status` al final en estado `up to date`.

## Pruebas
- Ejecución real en Windows: OK.

## Riesgos
- Sin script dedicado de reseed se incrementa riesgo operativo en pruebas de foundation.

## Documentación a actualizar
- `package.json`
- `tools/reset-db-reseed.sh`
- `tools/reset-local.sh`

## Evidencia documental
- `tools/reset-db-reseed.sh`
- `tools/reset-local.sh`
- `package.json`

## Pendientes no resueltos
- Ninguno.
