# T-0330 - Crear `.env.example` por app

## Metadatos
- ID: `T-0330`
- Fase: `Fase 3`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Crear los archivos `.env.example` para las apps que faltaban: web, worker y desktop. La API ya tenia el suyo desde T-0319.

## Criterios de aceptación
- [x] `apps/api/.env.example` — existia (T-0319), validado: DATABASE_URL, REDIS, S3, JWT, PORT, NODE_ENV.
- [x] `apps/web/.env.example` — creado: VITE_API_URL, VITE_APP_NAME, VITE_ENV.
- [x] `apps/worker/.env.example` — creado: DATABASE_URL, REDIS, S3, NODE_ENV.
- [x] `apps/desktop/.env.example` — creado: VITE_API_URL, VITE_APP_NAME, VITE_ENV, DESKTOP_DATA_DIR.
- [x] Todos los valores son ejemplos de desarrollo — sin secretos reales.
- [x] Todos coinciden con `docs/02-architecture/18-referencia-env-vars.md`.

## Archivos creados
- `apps/web/.env.example`
- `apps/worker/.env.example`
- `apps/desktop/.env.example`

## Cobertura de .env.example

| App       | Archivo              | Variables cubiertas                        |
| --------- | -------------------- | ------------------------------------------ |
| api       | `apps/api/.env.example` | DATABASE_URL, REDIS, S3, JWT, PORT, NODE_ENV |
| web       | `apps/web/.env.example` | VITE_API_URL, VITE_APP_NAME, VITE_ENV     |
| worker    | `apps/worker/.env.example` | DATABASE_URL, REDIS, S3, NODE_ENV     |
| desktop   | `apps/desktop/.env.example` | VITE_API_URL, VITE_APP_NAME, VITE_ENV, DESKTOP_DATA_DIR |

## Pendientes no resueltos
- Ninguno.
