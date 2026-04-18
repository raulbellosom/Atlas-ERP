# Guia de Desarrollo Local con Docker (Windows)

## Objetivo
Estandarizar el flujo local en Windows para correr la infraestructura de AtlasERP con Docker y las apps en host.

## Alcance
- Infraestructura en Docker: PostgreSQL, Redis, MinIO.
- Apps en host: API, Worker, Web (fase actual del proyecto).
- Entorno staging/prod en Docker queda fuera de esta guia operativa diaria.

## Pre-requisitos
- Docker Desktop instalado y corriendo.
- Node.js 20+ y pnpm 9+.
- Dependencias instaladas (`pnpm install`).

## Flujo recomendado (PowerShell)
1. Levantar infraestructura:
```powershell
pnpm infra:up
```
2. Validar estado:
```powershell
pnpm infra:status
```
3. Levantar apps en host:
```powershell
pnpm dev
```
4. Ver logs de infraestructura cuando sea necesario:
```powershell
pnpm infra:logs
```

## Endpoints locales
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

## Nota sobre Nginx
- `docker-compose.dev.yml` NO incluye Nginx.
- Nginx solo existe en `docker-compose.staging.yml` y `docker-compose.prod.yml`.

## Comandos utiles
- Detener infraestructura:
```powershell
pnpm infra:down
```
- Reset destructivo de infraestructura (borra volumenes):
```powershell
pnpm infra:reset
```

## Convencion de endpoints S3
- App en host (dev): `S3_ENDPOINT=http://localhost:9000`
- App en Docker (staging/prod): `S3_ENDPOINT=http://minio:9000`
- Para URLs firmadas en browser: usar `S3_PUBLIC_URL` con endpoint accesible por cliente.
