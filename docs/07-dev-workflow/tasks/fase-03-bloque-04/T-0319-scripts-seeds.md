# T-0319 - Configurar scripts para seeds

## Metadatos
- ID: `T-0319`
- Fase: `Fase 3`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Establecer el entry point de seeds de la base de datos y el archivo `.env.example` de la API con todas las variables necesarias para el entorno de desarrollo local.

## Criterios de aceptación
- [x] `prisma/seeds/index.ts` creado como entry point del sistema de seeds.
- [x] El seed file importa PrismaClient y tiene estructura lista para recibir seeds reales.
- [x] Comentarios con el patrón de importación para seeds por entidad.
- [x] `apps/api/.env.example` creado con todas las variables requeridas por la API.
- [x] `.env.example` cubre: DATABASE_URL, REDIS, S3/MinIO, JWT, PORT, NODE_ENV.
- [x] Script `"db:seed"` en `apps/api/package.json`: `ts-node prisma/seeds/index.ts` (existía).
- [x] Script `"db:seed"` en raíz: `pnpm --filter=@atlasrep/api db:seed` (existía).

## Archivos creados/modificados
- `prisma/seeds/index.ts`
- `apps/api/.env.example`

## Estructura del sistema de seeds (patrón final — Fase 5+)

```
prisma/seeds/
  index.ts          — Entry point (este archivo)
  organizations.ts  — Seed de organizaciones (stub hasta Fase 5)
  roles.ts          — Seed de roles y permisos base
  users.ts          — Seed de usuario admin inicial
```

## Variables de entorno documentadas

| Variable         | Descripción                        | Valor por defecto local       |
| ---------------- | ---------------------------------- | ----------------------------- |
| DATABASE_URL     | Conexion PostgreSQL (Prisma)       | postgresql://...@localhost/.. |
| REDIS_HOST       | Host de Redis (BullMQ)             | localhost                     |
| REDIS_PORT       | Puerto de Redis                    | 6379                          |
| S3_ENDPOINT      | URL de MinIO local                 | http://localhost:9000          |
| S3_ACCESS_KEY    | Clave de acceso MinIO              | atlasrep                      |
| S3_SECRET_KEY    | Secreto MinIO                      | atlasrep_dev                  |
| S3_BUCKET        | Bucket por defecto                 | atlasrep-dev                  |
| JWT_SECRET       | Clave de firma JWT (min 32 chars)  | (cambiar en produccion)       |
| JWT_EXPIRES_IN   | Duracion de tokens                 | 7d                            |
| PORT             | Puerto del servidor NestJS         | 3000                          |
| NODE_ENV         | Entorno de ejecucion               | development                   |

## Decisiones técnicas
- **`prisma/seeds/` en raíz, no en `apps/api/`**: Los seeds son parte del schema Prisma, que es compartido. El script se ejecuta desde `apps/api` por tener acceso al cliente generado.
- **`ts-node` para ejecutar seeds**: Sin compilar — solo para seeds de desarrollo. En CI se puede usar `tsx` como alternativa más rápida.
- **Seeds vacíos en esta fase**: Los datos reales se definen cuando los modelos Prisma existen (Fase 5).

## Pendientes no resueltos
- Ninguno. Seeds reales se implementan en Fase 5 junto con los modelos Prisma.
