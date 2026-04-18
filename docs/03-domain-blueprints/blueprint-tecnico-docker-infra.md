# Blueprint Técnico: Infraestructura Docker

## Identificación
- Directorio: `infra/docker/`
- Herramienta: Docker + Docker Compose
- Ambientes: development, staging, production

## Propósito
Definir los servicios que corren en Docker, su configuración mínima, redes, volúmenes y cómo se organizan por ambiente.

## Servicios en Docker

| Servicio | Imagen base | Propósito |
|----------|-------------|-----------|
| `postgres` | `postgres:16-alpine` | Base de datos central |
| `redis` | `redis:7-alpine` | Colas (Bull) y caché |
| `minio` | `minio/minio` | Almacenamiento S3 compatible |
| `api` | Dockerfile propio | Backend NestJS |
| `worker` | Dockerfile propio | Jobs y sincronización |
| `web` | Dockerfile propio (nginx) | Frontend web estático |

## Servicios NO en Docker
- App desktop (Tauri): se distribuye como instalable nativo
- Base de datos SQLite del cliente: vive en el dispositivo del usuario

## Archivos de Compose por ambiente

| Archivo | Ambiente |
|---------|---------|
| `infra/docker/docker-compose.dev.yml` | Desarrollo local |
| `infra/docker/docker-compose.staging.yml` | Staging |
| `infra/docker/docker-compose.prod.yml` | Producción |

## Redes
- Red interna `atlasnet` entre todos los servicios.
- Solo los servicios que deben ser accesibles externamente exponen puertos al host.
- En producción: solo el proxy (nginx) expone el puerto 80/443.

## Volúmenes persistentes
- `postgres_data` — datos de PostgreSQL
- `redis_data` — datos de Redis (opcional según configuración)
- `minio_data` — archivos de MinIO

## Healthchecks mínimos
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`
- MinIO: HTTP GET al endpoint de salud
- API: HTTP GET a `/health`

## Consideraciones de seguridad
- Las credenciales de base de datos nunca se hardcodean en el archivo Compose.
- Se inyectan via archivo `.env` local (dev) o via gestor de secretos (prod).
- En producción, los servicios no exponen puertos de base de datos al exterior.
