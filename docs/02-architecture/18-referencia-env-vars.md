# Referencia de Variables de Entorno por App

## ID de documento
- Task origen: `T-0328`
- Estado: `aprobado`
- Fecha: `2026-04-12`
- Extiende: `docs/02-architecture/10-estrategia-environment-variables.md`

## Proposito

Catalogo completo de todas las variables de entorno del proyecto AtlasERP, organizadas por app. Toda variable nueva debe registrarse aqui al mismo tiempo que se agrega al `.env.example` correspondiente.

## Reglas (canon — no negociables)

1. Formato: `MAYUSCULAS_CON_GUION_BAJO`.
2. Prefijo obligatorio segun app: `API_`, `VITE_`, `DESKTOP_`, `WORKER_`.
3. Variables de conexion compartidas (DB, Redis, S3) sin prefijo de app.
4. Ningun secreto en git — solo el `.env.example` con valores de ejemplo.
5. Toda variable nueva requiere actualizar `.env.example` y este documento.
6. La app debe fallar al arrancar si falta una variable obligatoria.

---

## `apps/api` — Backend NestJS

| Variable              | Obligatoria | Descripcion                              | Ejemplo                                         |
| --------------------- | ----------- | ---------------------------------------- | ----------------------------------------------- |
| `DATABASE_URL`        | Si          | URL completa de PostgreSQL (Prisma)      | `postgresql://user:pass@localhost:5432/atlasrep` |
| `REDIS_HOST`          | Si          | Host de Redis (BullMQ)                   | `localhost`                                     |
| `REDIS_PORT`          | Si          | Puerto de Redis                          | `6379`                                          |
| `S3_ENDPOINT`         | Si          | Endpoint S3/MinIO                        | `http://localhost:9000`                         |
| `S3_PUBLIC_URL`       | No          | Endpoint público para URLs firmadas      | `http://localhost:9000`                         |
| `S3_ACCESS_KEY`       | Si          | Access key S3/MinIO                      | `atlasrep`                                      |
| `S3_SECRET_KEY`       | Si          | Secret key S3/MinIO                      | `atlasrep_dev`                                  |
| `S3_BUCKET`           | Si          | Bucket por defecto                       | `atlasrep-dev`                                  |
| `S3_REGION`           | No          | Region S3 (MinIO ignora)                 | `us-east-1`                                     |
| `S3_PRESIGNED_EXPIRY_SECONDS` | No  | Expiración default de URLs firmadas (segundos) | `300`                                   |
| `JWT_SECRET`          | Si          | Clave de firma JWT (min 32 chars)        | `change-me-in-production`                       |
| `JWT_EXPIRES_IN`      | No          | Duracion de tokens JWT                   | `7d`                                            |
| `PORT`                | No          | Puerto del servidor NestJS               | `3000`                                          |
| `NODE_ENV`            | Si          | Entorno (`development`/`production`/`test`) | `development`                               |

---

## `apps/web` — Frontend React (Vite)

Solo variables con prefijo `VITE_` son accesibles en el navegador.

| Variable              | Obligatoria | Descripcion                              | Ejemplo                  |
| --------------------- | ----------- | ---------------------------------------- | ------------------------ |
| `VITE_API_URL`        | Si          | URL base del backend API                 | `http://localhost:3000/api` |
| `VITE_APP_NAME`       | No          | Nombre de la app (titulo del navegador)  | `AtlasERP`              |
| `VITE_ENV`            | No          | Entorno para mostrar en UI               | `development`            |

---

## `apps/worker` — Worker NestJS (BullMQ)

| Variable              | Obligatoria | Descripcion                              | Ejemplo                                         |
| --------------------- | ----------- | ---------------------------------------- | ----------------------------------------------- |
| `DATABASE_URL`        | Si          | Misma URL que API (comparte BD)          | `postgresql://user:pass@localhost:5432/atlasrep` |
| `REDIS_HOST`          | Si          | Host de Redis (misma instancia que API)  | `localhost`                                     |
| `REDIS_PORT`          | Si          | Puerto de Redis                          | `6379`                                          |
| `S3_ENDPOINT`         | Si          | Endpoint S3/MinIO (para jobs de archivos) | `http://localhost:9000`                        |
| `S3_ACCESS_KEY`       | Si          | Access key S3/MinIO                      | `atlasrep`                                      |
| `S3_SECRET_KEY`       | Si          | Secret key S3/MinIO                      | `atlasrep_dev`                                  |
| `S3_BUCKET`           | Si          | Bucket de trabajo                        | `atlasrep-dev`                                  |
| `NODE_ENV`            | Si          | Entorno                                  | `development`                                   |

---

## `apps/desktop` — Desktop Tauri

El desktop no tiene variables de entorno del sistema en el mismo sentido; su configuracion se almacena localmente en SQLite y en archivos de preferencias gestionados por Tauri.

| Variable              | Obligatoria | Descripcion                                   | Ejemplo                  |
| --------------------- | ----------- | --------------------------------------------- | ------------------------ |
| `VITE_API_URL`        | Si          | URL del backend al que conecta el desktop     | `http://localhost:3000/api` |
| `VITE_APP_NAME`       | No          | Nombre en la ventana Tauri                    | `AtlasERP`               |
| `DESKTOP_DATA_DIR`    | No          | Directorio nativo local (por defecto: auto)   | `/home/user/.atlasrep`   |
| `VITE_DESKTOP_DATA_DIR` | No        | Variante visible en frontend React/Vite       | `/home/user/.atlasrep`   |

---

## Actualizacion de este documento

Toda nueva variable de entorno debe:
1. Agregarse a `.env.example` de la app correspondiente.
2. Agregarse a esta tabla con su descripcion y si es obligatoria.
3. Implementar validacion en el arranque de la app (Fase 3 / T-0331-T-0334).
