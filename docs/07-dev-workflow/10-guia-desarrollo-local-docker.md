# Guia de Desarrollo Local con Docker (Windows)

## Objetivo

Estandarizar el flujo local en Windows para correr la infraestructura de
AtlasERP con Docker y las apps en host usando un solo `.env` raiz.

## Alcance

- Infraestructura en Docker: PostgreSQL, Redis, MinIO.
- Apps en host: API, Worker, Web y Desktop.
- Entorno staging/prod en Docker queda fuera de esta guia operativa diaria.

## Pre-requisitos

- Docker Desktop instalado y corriendo.
- Node.js 20+ y pnpm 9+.
- Dependencias instaladas (`pnpm install`).
- Archivo `/.env` creado desde `/.env.example`.

## Flujo recomendado (PowerShell)

1. Crear configuracion local si aun no existe:

```powershell
Copy-Item .env.example .env
```

2. Levantar infraestructura:

```powershell
pnpm infra:up
```

3. Validar estado:

```powershell
pnpm infra:status
```

4. Ejecutar migraciones:

```powershell
pnpm db:migrate
```

5. Levantar apps en host:

```powershell
pnpm dev
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

- Ver logs:

```powershell
pnpm infra:logs
```

## Convencion de endpoints S3-compatible

- Las apps usan variables `S3_*` aunque el proveedor local sea MinIO.
- App en host (dev): `S3_ENDPOINT=http://localhost:9000`
- App en Docker (staging/prod): `S3_ENDPOINT=http://minio:9000`
- Para URLs firmadas en browser: usar `S3_PUBLIC_URL` con endpoint accesible por
  cliente.
- El bucket local se toma de `S3_BUCKET`; el valor canonico es `atlaserp-dev`.
