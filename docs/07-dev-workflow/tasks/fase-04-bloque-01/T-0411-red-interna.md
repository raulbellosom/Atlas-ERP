# T-0411 - Configurar red interna entre servicios

## Metadatos
- ID: `T-0411`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Crear las configuraciones de nginx para staging y produccion, y documentar la topologia de red interna de Docker: como se comunican los servicios entre si y como el trafico externo llega a la aplicacion.

## Criterios de aceptacion
- [x] Red `atlasrep-internal` tipo bridge declarada en docker-compose.staging.yml y docker-compose.prod.yml.
- [x] `infra/nginx/staging.conf` creado — HTTP, proxy a api y web por nombre de servicio.
- [x] `infra/nginx/prod.conf` creado — HTTPS con certificados Let's Encrypt, redireccion HTTP→HTTPS.
- [x] nginx como unico punto de entrada externo (puertos 80 y 443).
- [x] Servicios de infra (postgres, redis, minio) sin puertos expuestos en staging/prod.
- [x] Servicios de app (api, worker, web) sin puertos expuestos — solo accesibles internamente.
- [x] Routing: `/api/*` → contenedor `api:3000`, `/*` → contenedor `web:80`.

## Archivos creados
- `infra/nginx/staging.conf`
- `infra/nginx/prod.conf`

## Topologia de red

### Staging
```
Internet
    │
    └── nginx:80 (unico puerto expuesto)
            ├── /api/* ──────► api:3000  (red interna)
            └── /*      ──────► web:80   (red interna)

Red interna atlasrep-internal:
  api ──► postgres:5432
  api ──► redis:6379
  api ──► minio:9000
  worker ──► postgres:5432
  worker ──► redis:6379
  worker ──► minio:9000
```

### Produccion
```
Internet
    ├── :80 ──► 301 redirect → HTTPS
    └── :443 ──► nginx (SSL termination)
                    ├── /api/* ──► api:3000
                    └── /*      ──► web:80

Certificados: /etc/letsencrypt/live/${DOMAIN}/
```

## Configuracion de nginx por ambiente

### Staging (`infra/nginx/staging.conf`)
- Sin SSL (se asume tunel o balanceador externo si se necesita HTTPS).
- Cabeceras de seguridad basicas: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.
- `client_max_body_size 50m` para uploads de archivos.
- SPA fallback: rutas desconocidas del frontend → `index.html`.

### Produccion (`infra/nginx/prod.conf`)
- Redireccion automatica HTTP (80) → HTTPS (443).
- SSL con `TLSv1.2` y `TLSv1.3`, sin TLS 1.0/1.1.
- `HSTS` con `max-age=31536000; includeSubDomains`.
- Gzip para assets estaticos (`text/css`, `application/javascript`, etc.).
- Bloqueo de acceso a archivos ocultos (`location ~ /\.`).
- `X-Forwarded-Proto: https` para que NestJS sepa que el request original era HTTPS.

## Red Docker

```yaml
networks:
  atlasrep-internal:
    driver: bridge
```
- `bridge` (default): red privada virtual en el host Docker.
- Los contenedores se resuelven por nombre de servicio (DNS interno de Docker).
- Ninguna red es accesible desde internet salvo los puertos publicados en nginx.

## Diferencias staging vs prod en nginx

| Aspecto           | staging.conf              | prod.conf                              |
| ----------------- | ------------------------- | -------------------------------------- |
| SSL               | No                        | Si (Let's Encrypt)                     |
| Puerto            | 80                        | 80 (redirect) + 443                    |
| HSTS              | No                        | Si (`max-age=31536000`)                |
| Gzip              | No                        | Si                                     |
| Cabeceras extra   | 3 basicas                 | 5 incluyendo `X-XSS-Protection`        |

## Variable `${DOMAIN}` en prod.conf

La variable `${DOMAIN}` en `prod.conf` no es una variable de nginx nativa — se debe sustituir via:
- `envsubst` en el entrypoint del contenedor nginx, o
- Configuracion directa del dominio al desplegar (reemplazar `${DOMAIN}` con el dominio real).

En la Fase 6 (CI/CD pipeline) se documentara como inyectar esta variable al desplegar.

## Pendientes no resueltos
- Configuracion de Let's Encrypt (certbot) para obtener/renovar certificados — Fase 6.
- Rate limiting en nginx para endpoints sensibles (`/api/auth/*`) — mejora de seguridad post-MVP.
- WebSocket support si se implementa comunicacion en tiempo real — Fase 5+.
