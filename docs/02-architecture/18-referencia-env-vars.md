# Referencia de Variables de Entorno

## ID de documento

- Task origen: `T-0328`
- Estado: `aprobado`
- Fecha: `2026-04-12`
- Extiende: `docs/02-architecture/10-estrategia-environment-variables.md`

## Proposito

Catalogo de las variables de entorno de AtlasERP. Todas viven en `/.env` para
desarrollo local y se documentan en `/.env.example`.

## Reglas canonicas

1. Formato: `MAYUSCULAS_CON_GUION_BAJO`.
2. Un solo archivo local soportado: `/.env`.
3. Solo `/.env.example` se versiona como catalogo de ejemplo.
4. Ningun secreto real en git.
5. Toda variable nueva requiere actualizar `/.env.example` y este documento.
6. Las apps deben fallar al arrancar si falta una variable obligatoria.
7. `S3_*` significa almacenamiento S3-compatible; MinIO es el proveedor local.

---

## Infraestructura compartida

| Variable                      | Obligatoria    | Descripcion                             | Ejemplo                                                          |
| ----------------------------- | -------------- | --------------------------------------- | ---------------------------------------------------------------- |
| `POSTGRES_USER`               | Si para Docker | Usuario PostgreSQL local                | `atlaserp`                                                       |
| `POSTGRES_PASSWORD`           | Si para Docker | Password PostgreSQL local               | `atlaserp_dev`                                                   |
| `POSTGRES_DB`                 | Si para Docker | Base PostgreSQL local                   | `atlaserp_dev`                                                   |
| `DATABASE_URL`                | Si             | URL completa de PostgreSQL (Prisma)     | `postgresql://atlaserp:atlaserp_dev@localhost:5432/atlaserp_dev` |
| `REDIS_HOST`                  | Si             | Host de Redis                           | `localhost`                                                      |
| `REDIS_PORT`                  | Si             | Puerto de Redis                         | `6379`                                                           |
| `REDIS_PASSWORD`              | No             | Password Redis si el ambiente lo exige  | `change-me`                                                      |
| `S3_ENDPOINT`                 | Si             | Endpoint privado S3-compatible          | `http://localhost:9000`                                          |
| `S3_PUBLIC_URL`               | No             | Endpoint publico para URLs firmadas     | `http://localhost:9000`                                          |
| `S3_ACCESS_KEY`               | Si             | Access key S3-compatible                | `atlaserp`                                                       |
| `S3_SECRET_KEY`               | Si             | Secret key S3-compatible                | `atlaserp_dev`                                                   |
| `S3_BUCKET`                   | Si             | Bucket de trabajo                       | `atlaserp-dev`                                                   |
| `S3_REGION`                   | No             | Region S3; MinIO local la ignora        | `us-east-1`                                                      |
| `S3_PRESIGNED_EXPIRY_SECONDS` | No             | Expiracion de URLs firmadas en segundos | `300`                                                            |

---

## API NestJS

| Variable         | Obligatoria | Descripcion                                  | Ejemplo                                    |
| ---------------- | ----------- | -------------------------------------------- | ------------------------------------------ |
| `NODE_ENV`       | Si          | Entorno (`development`/`production`/`test`)  | `development`                              |
| `PORT`           | No          | Puerto HTTP                                  | `3000`                                     |
| `API_PREFIX`     | No          | Prefijo de rutas API                         | `api`                                      |
| `WEB_APP_URL`    | No          | URL del frontend para invitaciones y enlaces | `http://localhost:5173`                    |
| `JWT_SECRET`     | Si          | Clave de firma JWT                           | `change-me-in-production-use-32-chars-min` |
| `JWT_EXPIRES_IN` | No          | Duracion de tokens JWT                       | `7d`                                       |
| `LOG_LEVEL`      | No          | Nivel de logging                             | `info`                                     |

---

## Web y Desktop (Vite)

Solo variables con prefijo `VITE_` son accesibles en el navegador o bundle
embebido.

| Variable                | Obligatoria | Descripcion                            | Ejemplo                     |
| ----------------------- | ----------- | -------------------------------------- | --------------------------- |
| `VITE_API_URL`          | Si          | URL base del backend API               | `http://localhost:3000/api` |
| `VITE_APP_NAME`         | No          | Nombre visible de la app               | `AtlasERP`                  |
| `VITE_ENV`              | No          | Entorno visible para UI                | `development`               |
| `VITE_DESKTOP_DATA_DIR` | No          | Directorio local visible en UI desktop | `/home/user/.atlaserp`      |

---

## Desktop nativo

| Variable           | Obligatoria | Descripcion                                                             | Ejemplo                |
| ------------------ | ----------- | ----------------------------------------------------------------------- | ---------------------- |
| `DESKTOP_DATA_DIR` | No          | Directorio local nativo; si esta vacio Tauri usa el default del sistema | `/home/user/.atlaserp` |

---

## Module Store remoto

| Variable                              | Obligatoria | Descripcion                                  | Ejemplo                           |
| ------------------------------------- | ----------- | -------------------------------------------- | --------------------------------- |
| `MODULE_STORE_PROVIDER`               | No          | Proveedor de catalogo (`curated` o `remote`) | `curated`                         |
| `MODULE_STORE_REMOTE_CATALOG_URL`     | No          | URL del catalogo remoto                      | `https://catalog.example/modules` |
| `MODULE_STORE_REMOTE_TRUSTED_SIGNERS` | No          | Firmantes confiables separados por coma      | `signer-a,signer-b`               |
| `MODULE_STORE_REMOTE_CANARY_ORGS`     | No          | Organizaciones habilitadas para canary       | `org-1,org-2`                     |
| `MODULE_STORE_REMOTE_PARTIAL_PERCENT` | No          | Porcentaje de rollout parcial                | `25`                              |
| `MODULE_STORE_REMOTE_ROLLOUT_STAGE`   | No          | Etapa de rollout remoto                      | `total`                           |

---

## Actualizacion de este documento

Toda nueva variable de entorno debe agregarse a `/.env.example`, registrarse en
este documento y validarse al arranque cuando sea obligatoria.
