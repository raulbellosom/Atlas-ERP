# Guia de Debugging de Servicios Docker (Windows)

## Objetivo
Resolver fallas frecuentes de infraestructura Docker en AtlasERP con un checklist corto y repetible.

## Diagnostico rapido
1. Ver estado de contenedores:
```powershell
pnpm infra:status
```
2. Ver logs de servicios:
```powershell
pnpm infra:logs
```
3. Ver salud por contenedor:
```powershell
docker inspect --format='{{.Name}} -> {{.State.Health.Status}}' atlaserp-postgres atlaserp-redis atlaserp-minio
```

## Comandos por servicio
- PostgreSQL:
```powershell
docker compose -f infra/docker/docker-compose.dev.yml exec -T postgres pg_isready -U atlaserp -d atlaserp_dev
```
- Redis:
```powershell
docker compose -f infra/docker/docker-compose.dev.yml exec -T redis redis-cli ping
```
- MinIO:
```powershell
curl.exe -fsS http://localhost:9000/minio/health/live
```

## Problemas comunes
- Docker Desktop apagado:
  - Sintoma: `docker info` falla.
  - Accion: iniciar Docker Desktop y reintentar.
- Puerto ocupado (`5432`, `6379`, `9000`, `9001`):
  - Sintoma: `bind: address already in use`.
  - Accion: liberar puerto o cambiar mapeo en `infra/docker/docker-compose.dev.yml`.
- Contenedor unhealthy:
  - Sintoma: `status` no pasa a healthy.
  - Accion: revisar logs del servicio puntual y credenciales/env vars.
- Estado inconsistente de volumenes:
  - Sintoma: errores recurrentes despues de varios reinicios.
  - Accion: reset controlado con `pnpm infra:reset`.

## Comandos de recuperacion
- Reinicio no destructivo:
```powershell
pnpm infra:down
pnpm infra:up
```
- Reinicio destructivo:
```powershell
pnpm infra:reset
pnpm infra:up
```

## Nota de alcance
- Nginx no forma parte del stack local dev.
- Si la falla menciona Nginx, validar primero si se estaba usando `staging/prod` compose.

