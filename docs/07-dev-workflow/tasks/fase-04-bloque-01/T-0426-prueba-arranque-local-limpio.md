# T-0426 - Probar arranque completo local en limpio

## Metadatos
- ID: `T-0426`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Validar que la infraestructura local levanta desde cero en Windows con Docker Desktop activo.

## Criterios de aceptacion
- [x] Docker engine disponible y compose funcional.
- [x] `docker-compose.dev.yml` valido.
- [x] Arranque desde limpio (`down -v` seguido de `up -d`) exitoso.
- [x] Postgres, Redis y MinIO en estado `healthy`.

## Evidencia ejecutada
```powershell
docker --version
docker compose version
docker info --format '{{.ServerVersion}}'
docker compose -f infra/docker/docker-compose.dev.yml config --quiet

docker compose -f infra/docker/docker-compose.dev.yml down -v --remove-orphans
docker compose -f infra/docker/docker-compose.dev.yml up -d
docker compose -f infra/docker/docker-compose.dev.yml ps
```

## Resultado de la prueba
- Docker detectado: `29.3.1`.
- Compose detectado: `v5.1.1`.
- Compose dev valido: `OK`.
- Servicios levantados y saludables:
  - `postgres healthy`
  - `redis healthy`
  - `minio healthy`

## Observaciones
- En primer arranque se descargaron imagenes base (comportamiento esperado).
- En `dev` no participa Nginx; solo aplica en `staging/prod`.
