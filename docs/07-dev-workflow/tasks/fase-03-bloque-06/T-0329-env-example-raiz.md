# T-0329 - Crear `.env.example` raíz

## Metadatos
- ID: `T-0329`
- Fase: `Fase 3`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Crear el archivo `.env.example` raíz del monorepo con las variables de infraestructura compartida y referencias a los `.env.example` por app.

## Criterios de aceptación
- [x] `.env.example` creado en la raíz del monorepo.
- [x] Contiene variables de infraestructura compartida: DATABASE_URL, REDIS_*, S3_*.
- [x] Los valores coinciden con `infra/docker/docker-compose.dev.yml`.
- [x] Referencia a cada `.env.example` por app.
- [x] Referencia a la documentacion de env vars.
- [x] NUNCA contiene secretos reales — solo valores de ejemplo para desarrollo local.
- [x] `.env` y `.env.*` estan en `.gitignore` (verificado desde T-0300).

## Archivo creado
- `.env.example`

## Relacion con docker-compose.dev.yml

Las credenciales del `.env.example` raíz son exactamente las mismas que define el docker-compose de desarrollo. Esto garantiza que un desarrollador nuevo que haga `pnpm bootstrap` tenga un entorno funcional sin editar nada.

| Variable        | .env.example raíz  | docker-compose.dev.yml       |
| --------------- | ------------------- | ----------------------------- |
| POSTGRES_USER   | atlasrep            | POSTGRES_USER: atlasrep       |
| POSTGRES_PASS   | atlasrep_dev        | POSTGRES_PASSWORD: atlasrep_dev |
| S3_ACCESS_KEY   | atlasrep            | MINIO_ROOT_USER: atlasrep     |
| S3_SECRET_KEY   | atlasrep_dev        | MINIO_ROOT_PASSWORD: atlasrep_dev |

## Pendientes no resueltos
- Ninguno. Los `.env.example` por app (web, worker, desktop) se crean en T-0330.
