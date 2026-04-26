# apps/api/Dockerfile
# Multi-stage build para el backend NestJS de AtlasERP.
# Resultado: imagen minima con Node 20 Alpine + dist/ compilado.
#
# Build desde la raiz del monorepo:
#   docker build -f apps/api/Dockerfile -t atlaserp/api:latest .

# â”€â”€ Stage 1: dependencias + build â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
FROM node:20-alpine AS builder

# Instalar pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar manifiestos del monorepo primero (cache de capas)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/

# Instalar solo las dependencias necesarias para el build
RUN pnpm install --frozen-lockfile --filter=@atlaserp/api...

# Copiar el codigo fuente
COPY packages/config/ ./packages/config/
COPY apps/api/ ./apps/api/

# Generar cliente Prisma si existe schema
COPY prisma/ ./prisma/
RUN pnpm --filter=@atlaserp/api db:generate 2>/dev/null || true

# Build de produccion
RUN pnpm --filter=@atlaserp/api build

# â”€â”€ Stage 2: imagen de produccion â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Instalar solo dependencias de produccion
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/

RUN pnpm install --frozen-lockfile --filter=@atlaserp/api... --prod

# Copiar artefactos del build
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Instalar curl para el healthcheck
RUN apk add --no-cache curl

# Usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/main.js"]

