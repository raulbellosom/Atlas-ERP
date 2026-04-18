# T-0427 - Probar teardown limpio

## Metadatos
- ID: `T-0427`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Validar que el stack local puede apagarse de forma limpia sin dejar contenedores huerfanos.

## Criterios de aceptacion
- [x] `docker compose down` ejecuta sin error.
- [x] `docker compose ps` queda vacio al finalizar.
- [x] Red del proyecto se elimina correctamente.
- [x] Volumenes persisten (sin `-v`) para soportar reinicio con datos.

## Evidencia ejecutada
```powershell
docker compose -f infra/docker/docker-compose.dev.yml down
docker compose -f infra/docker/docker-compose.dev.yml ps
docker volume ls --format '{{.Name}}'
```

## Resultado de la prueba
- Teardown completado sin errores.
- `ps` sin servicios activos.
- Volumenes encontrados despues de down:
  - `docker_postgres_data`
  - `docker_redis_data`
  - `docker_minio_data`

## Observaciones
- El teardown no destructivo deja datos listos para reinicio rapido.
- Para borrado total de datos se requiere `down -v` o `pnpm infra:reset`.
