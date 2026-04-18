# apps/worker/Dockerfile
# Multi-stage build para el worker NestJS de AtlasERP.
# Resultado: imagen minima con Node 20 Alpine + dist/ compilado.
#
# Build desde la raiz del monorepo:
#   docker build -f apps/worker/Dockerfile -t atlasrep/worker:latest .

# ── Stage 1: dependencias + build ─────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar manifiestos del monorepo primero (cache de capas)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/config/package.json ./packages/config/

# Instalar solo las dependencias necesarias para el build
RUN pnpm install --frozen-lockfile --filter=@atlasrep/worker...

# Copiar el codigo fuente
COPY packages/config/ ./packages/config/
COPY apps/worker/ ./apps/worker/

# Generar cliente Prisma si el worker tiene acceso a la BD
COPY prisma/ ./prisma/
RUN pnpm --filter=@atlasrep/worker exec prisma generate 2>/dev/null || true

# Build de produccion
RUN pnpm --filter=@atlasrep/worker build

# ── Stage 2: imagen de produccion ─────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Instalar solo dependencias de produccion
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/config/package.json ./packages/config/

RUN pnpm install --frozen-lockfile --filter=@atlasrep/worker... --prod

# Copiar artefactos del build
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S worker -u 1001
USER worker

WORKDIR /app/apps/worker

ENV NODE_ENV=production

# El worker no expone puertos HTTP
CMD ["node", "dist/main.js"]
