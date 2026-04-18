# T-0423 - Configurar variables de entorno de docker

## Metadatos
- ID: `T-0423`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Consolidar y documentar todas las variables de entorno que usan los servicios Docker de AtlasERP, su origen (hardcoded en dev vs secrets en CI/CD) y como se inyectan por ambiente.

## Criterios de aceptacion
- [x] Tabla completa de variables por servicio.
- [x] Diferencia clara: dev (hardcoded en compose) vs staging/prod (${VAR} desde CI/CD).
- [x] `.env.example` documentado como fuente de referencia para desarrolladores locales.
- [x] Ninguna variable sensible hardcodeada en archivos que se commitean (salvo dev local).

## Variables por servicio

### PostgreSQL
| Variable          | Dev (hardcoded)   | Staging/Prod           |
| ----------------- | ----------------- | ---------------------- |
| POSTGRES_USER     | `atlasrep`        | `${POSTGRES_USER}`     |
| POSTGRES_PASSWORD | `atlasrep_dev`    | `${POSTGRES_PASSWORD}` |
| POSTGRES_DB       | `atlasrep_dev`    | `${POSTGRES_DB}`       |

### Redis
| Variable       | Dev       | Staging/Prod           |
| -------------- | --------- | ---------------------- |
| REDIS_PASSWORD | (sin auth)| `${REDIS_PASSWORD}`    |

### MinIO
| Variable           | Dev            | Staging/Prod          |
| ------------------ | -------------- | --------------------- |
| MINIO_ROOT_USER    | `atlasrep`     | `${S3_ACCESS_KEY}`    |
| MINIO_ROOT_PASSWORD| `atlasrep_dev` | `${S3_SECRET_KEY}`    |

### API (NestJS)
| Variable         | Dev (en .env)         | Staging/Prod                 |
| ---------------- | --------------------- | ---------------------------- |
| DATABASE_URL     | `postgresql://atlasrep:atlasrep_dev@localhost:5432/atlasrep_dev` | `${DATABASE_URL}` |
| REDIS_HOST       | `localhost`           | `redis`                      |
| REDIS_PORT       | `6379`                | `6379`                       |
| REDIS_PASSWORD   | (vacio)               | `${REDIS_PASSWORD}`          |
| S3_ENDPOINT      | `http://localhost:9000` | `http://minio:9000`        |
| S3_ACCESS_KEY    | `atlasrep`            | `${S3_ACCESS_KEY}`           |
| S3_SECRET_KEY    | `atlasrep_dev`        | `${S3_SECRET_KEY}`           |
| S3_BUCKET        | `atlasrep-files`      | `${S3_BUCKET}`               |
| JWT_SECRET       | `dev-jwt-secret-local`| `${JWT_SECRET}`              |
| JWT_EXPIRES_IN   | `7d`                  | `${JWT_EXPIRES_IN:-7d}`      |
| NODE_ENV         | `development`         | `production`                 |
| PORT             | `3000`                | `3000`                       |

### Worker (NestJS)
Idem API sin JWT_SECRET, JWT_EXPIRES_IN ni PORT.

## Origen de las variables por ambiente

### Desarrollo local
Las variables de la API viven en `apps/api/.env` (no commiteado, creado via `bootstrap.sh`).
El `docker-compose.dev.yml` tiene las variables hardcodeadas (valores locales, sin secretos reales).

### Staging / Produccion
Las variables con `${VAR}` en docker-compose son inyectadas por:
- **CI/CD secrets** (GitHub Actions / GitLab CI): definidas como secrets del repositorio.
- **Vault** (si se usa en Fase 6): variables obtenidas dinamicamente en el pipeline.

El proceso de build en CI/CD hace algo similar a:
```bash
export POSTGRES_PASSWORD="$(vault read secret/atlasrep/prod postgres_password)"
docker compose -f infra/docker/docker-compose.prod.yml up -d
```

## Convenciones

1. **Dev**: valores hardcodeados en docker-compose.dev.yml y en `.env` local. Nunca son secretos reales.
2. **Staging/Prod**: NUNCA hardcodear en docker-compose. Siempre `${VAR}` inyectado externamente.
3. **`.env.example`**: archivo commiteado con valores de ejemplo para desarrolladores. Sin secretos reales.
4. **`.env`**: NO se commitea (en `.gitignore`). Solo existe en el host del desarrollador.

## Archivos de referencia
- `docs/02-architecture/18-referencia-env-vars.md` — catalogo completo de env vars por app.
- `docs/02-architecture/11-estrategia-secretos.md` — politica de gestion de secretos.
- `apps/api/src/config/env.validation.ts` — validacion de vars al arrancar la API.

## Pendientes no resueltos
- `apps/api/.env.example` — se crea en Fase 5 al implementar los modulos de NestJS.
- Configuracion de CI/CD secrets — Fase 6.
