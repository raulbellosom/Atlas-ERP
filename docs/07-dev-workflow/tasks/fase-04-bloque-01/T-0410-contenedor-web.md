# T-0410 - Configurar contenedor del frontend web o estático

## Metadatos
- ID: `T-0410`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Documentar y materializar la configuracion del contenedor del frontend web de React/Vite en staging y produccion: imagen, estrategia de build estatico y servicio via nginx.

## Criterios de aceptacion
- [x] Imagen versionada: `atlasrep/web:${IMAGE_TAG:-latest}`.
- [x] El contenedor sirve el build estatico de Vite (archivos HTML/CSS/JS).
- [x] Sin variables de entorno en el contenedor — las vars de Vite se inyectan en BUILD TIME.
- [x] Sin puerto expuesto al host — nginx (contenedor separado) hace de proxy.
- [x] Red interna `atlasrep-internal`.
- [x] nginx redirige `/` al contenedor `web` y `/api/*` al contenedor `api`.
- [x] En desarrollo: Vite dev server corre en el HOST (no en Docker).

## Archivos modificados
- Configuracion ya materializada en docker-compose.staging.yml y docker-compose.prod.yml.

## Configuracion del contenedor

```yaml
web:
  image: atlasrep/web:${IMAGE_TAG:-latest}
  restart: always        # prod
  networks:
    - atlasrep-internal
  # sin environment: las vars de Vite van en build-time, no en run-time
  # sin ports: nginx hace de proxy
```

## Variables de entorno de Vite: build-time vs run-time

Las variables de Vite (prefijo `VITE_`) se incrustan en el bundle durante el build:
```bash
# En CI/CD al construir la imagen Docker del web:
VITE_API_URL=/api     # relativo al host — nginx resuelve a http://api:3000
VITE_APP_NAME=AtlasERP
VITE_ENVIRONMENT=production
```

**Por que no hay env vars en el contenedor en run-time:**
Vite genera un bundle estatico de JavaScript. Las variables de entorno se evaluan en BUILD TIME y quedan literales en el JS compilado. Inyectar vars en run-time no tiene efecto en el bundle ya construido.

## Estrategia de servicio

El Dockerfile del web (T-0417) usara multi-stage build:
```dockerfile
# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter=@atlasrep/web build

# Stage 2: serve
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY infra/nginx/spa.conf /etc/nginx/conf.d/default.conf
```
- El contenedor final solo contiene los archivos estaticos y nginx.
- Sin Node.js en produccion — imagen mucho mas pequena.

## Routing SPA

El Dockerfile incluye una config de nginx para SPA (`spa.conf`) que redirige todas las rutas desconocidas al `index.html`, necesario para React Router:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## En desarrollo: Vite corre en el HOST

En desarrollo el frontend NO se dockeriza. Se ejecuta directamente:
```bash
pnpm --filter=@atlasrep/web dev    # corre en localhost:5173
```
Las peticiones a `/api/*` van directamente al backend NestJS en `localhost:3000`.
Ver T-0401 para justificacion completa.

## Flujo de nginx (staging/prod)

```
Browser → nginx:80/443
  ├── GET /api/*     → http://api:3000
  └── GET /*         → http://web:80 (archivos estaticos)
```

## Decisiones tecnicas
- **Build estatico vs SSR**: AtlasERP usa React SPA estatica (no Next.js SSR). Las ventajas de SSR no justifican la complejidad adicional para un ERP de uso interno.
- **nginx dentro del contenedor web**: el Dockerfile del web embebe nginx para servir los estaticos. El nginx externo (contenedor separado) actua como entry point y proxy.
- **Sin `condition: service_healthy` en nginx → web**: `web` es un servidor nginx de estaticos, no tiene un healthcheck de aplicacion. El contenedor de nginx espera solo `service_started`.

## Pendientes no resueltos
- Dockerfile del web (multi-stage) — se crea en T-0417.
- Configuracion de nginx SPA (`spa.conf`) — se incluye en T-0417.
- Configuracion del nginx externo (proxy) — se crea en T-0411.
