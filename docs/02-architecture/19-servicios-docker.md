# Servicios Docker de AtlasERP

## ID de documento
- Task origen: `T-0400` / `T-0401`
- Estado: `aprobado`
- Fecha: `2026-04-12`

## Principio

Docker se usa **solo para servicios de infraestructura de servidor**. Las aplicaciones de codigo en desarrollo se ejecutan directamente en el host. En produccion, las apps de servidor (API, worker, web) se contienen; el desktop nunca.

---

## Servicios que corren en Docker

### Todos los ambientes (dev, staging, prod)

| Servicio    | Imagen                | Puerto(s)    | Proposito                                      |
| ----------- | --------------------- | ------------ | ---------------------------------------------- |
| `postgres`  | `postgres:16-alpine`  | 5432         | Base de datos principal (fuente de verdad)     |
| `redis`     | `redis:7-alpine`      | 6379         | Cola BullMQ + cache de sesiones                |
| `minio`     | `minio/minio:latest`  | 9000, 9001   | Almacenamiento de archivos S3-compatible        |

### Solo staging y produccion

| Servicio    | Imagen base           | Puerto(s)    | Proposito                                      |
| ----------- | --------------------- | ------------ | ---------------------------------------------- |
| `api`       | `node:20-alpine`      | 3000 (interno) | Backend NestJS — API REST                    |
| `worker`    | `node:20-alpine`      | (sin puerto) | Worker NestJS — jobs BullMQ                  |
| `web`       | `nginx:alpine`        | 80 (interno) | Frontend React — archivos estaticos via nginx  |
| `nginx`     | `nginx:alpine`        | 80, 443      | Reverse proxy — entrada unica al sistema       |

---

## Servicios que NO corren en Docker

| Servicio              | Motivo                                                              |
| --------------------- | ------------------------------------------------------------------- |
| `apps/desktop`        | Es un binario nativo Tauri — se distribuye como instalador del SO  |
| NestJS dev server     | En desarrollo se usa `nest start --watch` directamente en el host   |
| Vite dev server       | En desarrollo se usa `vite` directamente en el host                 |
| Tauri dev             | `tauri dev` requiere acceso al sistema grafico del host             |

---

## Ambientes y sus compose files

| Ambiente   | Archivo compose                          | Servicios incluidos                      |
| ---------- | ---------------------------------------- | ---------------------------------------- |
| `dev`      | `infra/docker/docker-compose.dev.yml`    | postgres, redis, minio                   |
| `staging`  | `infra/docker/docker-compose.staging.yml` | postgres, redis, minio, api, worker, web, nginx |
| `prod`     | `infra/docker/docker-compose.prod.yml`   | postgres, redis, minio, api, worker, web, nginx |

---

## Regla de oro (DevOpsCIAgent)

> **En desarrollo:** Docker solo para infraestructura (datos + colas + archivos). El codigo se ejecuta en el host para hot-reload y debugging eficiente.
>
> **En staging/prod:** Todo el codigo de servidor se contiene. El desktop nunca se dockeriza.


