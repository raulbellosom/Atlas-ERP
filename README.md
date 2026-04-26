# AtlasERP Monorepo

Plataforma modular de negocio con arquitectura monorepo y soporte offline-first controlado.

## Stack oficial

| Capa | Tecnologia |
|------|------------|
| Backend | NestJS + TypeScript + Prisma + PostgreSQL |
| Web | React + Vite + TailwindCSS 4.1 |
| Desktop | Tauri + React + SQLite local (cache/cola) |
| Worker | NestJS worker process + Redis |
| Archivos | MinIO / S3 compatible |
| Infra | Docker Compose |

## Estructura

```text
/
â”œâ”€ apps/
â”‚  â”œâ”€ api/
â”‚  â”œâ”€ web/
â”‚  â”œâ”€ desktop/
â”‚  â””â”€ worker/
â”œâ”€ packages/
â”œâ”€ prisma/
â”œâ”€ infra/
â”œâ”€ docs/
â””â”€ tools/
```

## Prerrequisitos

- Node.js `>= 20`
- pnpm `>= 9`
- Docker Desktop
- Para `apps/desktop`: Rust + Cargo + toolchain Tauri

Si usas PowerShell y tienes restriccion de scripts, ejecuta comandos como `pnpm.cmd ...`.

## Setup inicial (una sola vez)

```bash
pnpm install
pnpm infra:up
pnpm db:migrate
pnpm db:seed:setup
```

## Desarrollo

### Modo recomendado

```bash
pnpm dev
```

`pnpm dev` levanta solo:

- `@atlaserp/api`
- `@atlaserp/worker`
- `@atlaserp/web`

### Modo full stack (incluye desktop)

```bash
pnpm dev:all
```

`pnpm dev:all` tambien arranca `@atlaserp/desktop`, y requiere Rust/Cargo instalados.

## Infra local

```bash
pnpm infra:status
pnpm infra:logs
pnpm infra:down
```

## Reset local (volver al Setup Page)

### Reset completo (borra volumenes Docker + datos)

```bash
pnpm infra:reset
pnpm infra:up
pnpm db:migrate
pnpm db:seed:setup
```

Despues inicia web/api:

```bash
pnpm dev
```

Luego abre la app web y completa `"/setup"`.

### Reset de BD sin borrar volumenes

```bash
pnpm db:reset
pnpm db:seed:setup
```

Esto regresa al flujo de setup sin crear organización/usuarios demo.

## Produccion local / smoke

> `infra/docker/docker-compose.prod.yml` usa imagenes ya construidas/publicadas.

1. Configura variables de entorno productivas (`DATABASE_URL`, `JWT_SECRET`, credenciales Redis y S3).
2. Construye/publica imagenes `atlaserp/api`, `atlaserp/worker`, `atlaserp/web`.
3. Levanta compose productivo:

```bash
pnpm infra:up:prod
pnpm infra:logs:prod
```

4. Apaga stack:

```bash
pnpm infra:down:prod
```

## Task Catalog unificado

AtlasERP incluye catalogo global de tareas con:

- CRUD y asignacion (`/v1/tasks/*`)
- Dependencias con validacion de ciclos
- Historial de estados
- Ingesta automatica de docs/codigo cada 15 min
- SSE realtime (`/v1/tasks/stream`)
- Eventos Redis en `atlaserp.tasks.events`

Documentacion operativa:

- `docs/07-dev-workflow/task-catalog-operations.md`

## Reglas maestras

1. El servidor es la fuente de verdad.
2. SQLite local nunca reemplaza PostgreSQL.
3. No crear modulos/entidades sin ownership definido.
4. Toda accion critica debe auditarse.
5. No usar Bootstrap; usar TailwindCSS 4.1.

## Idioma y codificacion

- Idioma principal: espanol (MX)
- Archivos de texto: UTF-8

