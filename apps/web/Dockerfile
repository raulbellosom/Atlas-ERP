# apps/web/Dockerfile
# Multi-stage build para el frontend React/Vite de AtlasERP.
# Resultado: imagen nginx Alpine sirviendo el bundle estatico de Vite.
#
# Build desde la raiz del monorepo:
#   docker build -f apps/web/Dockerfile \
#     --build-arg VITE_API_URL=/api \
#     --build-arg VITE_APP_NAME=AtlasERP \
#     --build-arg VITE_ENVIRONMENT=production \
#     -t atlaserp/web:latest .

# â”€â”€ Stage 1: build del bundle estatico â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar manifiestos del monorepo primero (cache de capas)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/config/package.json ./packages/config/

# Instalar solo las dependencias de web
RUN pnpm install --frozen-lockfile --filter=@atlaserp/web...

# Copiar codigo fuente
COPY packages/config/ ./packages/config/
COPY apps/web/ ./apps/web/

# Variables de entorno de Vite (se incrustan en el bundle en build-time)
ARG VITE_API_URL=/api
ARG VITE_APP_NAME=AtlasERP
ARG VITE_ENVIRONMENT=production

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT

# Build de produccion
RUN pnpm --filter=@atlaserp/web build

# â”€â”€ Stage 2: imagen de produccion con nginx â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
FROM nginx:alpine AS runner

# Eliminar config default de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Config de nginx para SPA (React Router)
COPY <<'NGINXCONF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip para assets estaticos
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Cache largo para assets con hash (Vite genera hashes en los nombres)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback: todas las rutas desconocidas sirven index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINXCONF

# Copiar el build estatico de Vite
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

