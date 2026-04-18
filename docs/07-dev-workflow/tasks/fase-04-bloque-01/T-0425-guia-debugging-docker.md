# T-0425 - Crear guia de debugging de servicios docker

## Metadatos
- ID: `T-0425`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Documentar un playbook de debugging para detectar y resolver fallas de contenedores en desarrollo local.

## Criterios de aceptacion
- [x] Guia de debugging creada y versionada.
- [x] Comandos de diagnostico rapido incluidos.
- [x] Checks por servicio (Postgres, Redis, MinIO) incluidos.
- [x] Seccion de problemas comunes y recuperacion incluida.
- [x] Nota de alcance para evitar confundir `dev` con `staging/prod`.

## Archivos creados
- `docs/07-dev-workflow/11-guia-debugging-docker.md`

## Resultado
La guia permite pasar de error a accion con comandos directos en PowerShell, reduciendo tiempo de investigacion para incidencias locales.

## Pendientes no resueltos
- Automatizar este checklist en un script `tools/infra-doctor` (mejora futura).
