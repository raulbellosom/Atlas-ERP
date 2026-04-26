# AtlasERP Monorepo

Plataforma modular de negocio con arquitectura monorepo y soporte offline-first
controlado.

## Stack oficial

| Capa     | Tecnología                                |
| -------- | ----------------------------------------- |
| Backend  | NestJS + TypeScript + Prisma + PostgreSQL |
| Web      | React + Vite + TailwindCSS 4.1            |
| Desktop  | Tauri + React + SQLite local (cache/cola) |
| Worker   | NestJS worker process + Redis             |
| Archivos | MinIO / S3 compatible                     |
| Infra    | Docker Compose                            |

## Estructura

```text
/
├── apps/
│   ├── api/
│   ├── web/
│   ├── desktop/
│   └── worker/
├── packages/
├── prisma/
├── infra/
├── docs/
└── tools/
```

## Prerrequisitos

- Node.js `>= 20`
- pnpm `>= 9`
- Docker Desktop
- Para `apps/desktop`: Rust + Cargo + toolchain Tauri

Si usas PowerShell y tienes restricción de scripts, ejecuta comandos como
`pnpm.cmd ...`.

## Setup inicial (una sola vez)

```bash
pnpm install
cp .env.example .env
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

`pnpm dev:all` también arranca `@atlaserp/desktop`, y requiere Rust/Cargo
instalados.

## Infra local

```bash
pnpm infra:status
pnpm infra:logs
pnpm infra:down
```

## Reset local (volver al Setup Page)

### Reset completo (borra volúmenes Docker + datos)

```bash
pnpm infra:reset
pnpm infra:up
pnpm db:migrate
pnpm db:seed:setup
```

Después inicia web/api:

```bash
pnpm dev
```

Luego abre la app web y completa `"/setup"`.

### Reset de BD sin borrar volúmenes

```bash
pnpm db:reset
pnpm db:seed:setup
```

Esto regresa al flujo de setup sin crear organización/usuarios demo.

## Producción local / smoke

> `infra/docker/docker-compose.prod.yml` usa imágenes ya construidas/publicadas.

1. Configura variables de entorno productivas (`DATABASE_URL`, `JWT_SECRET`,
   credenciales Redis y S3).
2. Construye/publica imágenes `atlaserp/api`, `atlaserp/worker`, `atlaserp/web`.
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

AtlasERP incluye catálogo global de tareas con:

- CRUD y asignación (`/v1/tasks/*`)
- Dependencias con validación de ciclos
- Historial de estados
- Ingesta automática de docs/código cada 15 min
- SSE realtime (`/v1/tasks/stream`)
- Eventos Redis en `atlaserp.tasks.events`

Documentación operativa:

- `docs/07-dev-workflow/task-catalog-operations.md`

## Reglas maestras

1. El servidor es la fuente de verdad.
2. SQLite local nunca reemplaza PostgreSQL.
3. No crear módulos/entidades sin ownership definido.
4. Toda acción crítica debe auditarse.
5. No usar Bootstrap; usar TailwindCSS 4.1.

## Idioma y codificación

- Idioma principal: español (MX)
- Archivos de texto: UTF-8
