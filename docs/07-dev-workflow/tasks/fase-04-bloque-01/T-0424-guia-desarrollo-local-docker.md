# T-0424 - Crear guia de desarrollo local con docker

## Metadatos
- ID: `T-0424`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Crear una guia operativa para desarrollo local con Docker en Windows, con flujo claro de arranque, verificacion y apagado de infraestructura.

## Criterios de aceptacion
- [x] Guia creada y versionada en docs.
- [x] Flujo de uso diario documentado (up, status, logs, down).
- [x] Endpoints locales de infraestructura documentados.
- [x] Diferencia clara entre stack `dev` y stack `staging/prod`.
- [x] Nota explicita: Nginx no corre en `docker-compose.dev.yml`.

## Archivos creados
- `docs/07-dev-workflow/10-guia-desarrollo-local-docker.md`

## Resultado
Se definio una guia base para Windows que usa `pnpm infra:*` como entrada principal, evitando pasos ambiguos y dejando claro que en esta fase las apps corren en host y la infraestructura en Docker.

## Pendientes no resueltos
- Wrapper nativo PowerShell para `tools/bootstrap.sh` e `infra-up.sh` (actualmente en bash).
