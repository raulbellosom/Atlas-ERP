# T-0417 - Crear Dockerfile del frontend web

## Metadatos
- ID: `T-0417`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Crear el Dockerfile multi-stage para el frontend React/Vite de AtlasERP, con build estatico en Node y servicio via nginx Alpine.

## Criterios de aceptacion
- [x] `apps/web/Dockerfile` creado con multi-stage build (builder + runner).
- [x] Stage builder: Node 20 Alpine + Vite build → genera `dist/`.
- [x] Stage runner: nginx Alpine sirviendo los archivos estaticos.
- [x] Variables de entorno Vite inyectadas como `ARG` en build-time (no run-time).
- [x] Config SPA en nginx: `try_files $uri $uri/ /index.html` para React Router.
- [x] Cache headers para assets con hash (Vite genera hashes automaticamente).
- [x] Gzip activado para assets estaticos.
- [x] Build desde la raiz del monorepo.

## Archivo creado
- `apps/web/Dockerfile`

## Estrategia de build: ARG vs ENV

Vite incrustan las variables `VITE_*` en el bundle JavaScript durante el build.
Una vez compilado, el bundle ya tiene los valores literales — no se pueden cambiar en run-time.

Por eso se usan `ARG` (argumentos de build) en lugar de `ENV` de run-time:
```bash
docker build -f apps/web/Dockerfile \
  --build-arg VITE_API_URL=/api \
  --build-arg VITE_APP_NAME=AtlasERP \
  --build-arg VITE_ENVIRONMENT=production \
  -t atlasrep/web:latest .
```

**Consecuencia**: cada ambiente (staging/prod) necesita su propia imagen construida con los `ARG` correspondientes.

## Config de nginx para SPA

La config incrustada en el Dockerfile incluye:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
Sin este fallback, React Router generaria errores 404 al navegar directamente a `/compras/123`.

## Cache de assets

Vite genera nombres de archivos con hash de contenido:
- `assets/index-Bc9kf2A1.js`
- `assets/index-Df3gG1x0.css`

Gracias a estos hashes, se puede usar cache agresivo:
```nginx
location ~* \.(js|css|...)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```
Si el codigo cambia, el hash cambia → el browser descarga la nueva version automaticamente.

## Imagen final: solo nginx

El stage runner (`FROM nginx:alpine`) NO incluye Node.js.
La imagen final es muy pequena (~25MB) vs Node Alpine (~170MB).

## Diferencias vs Dockerfiles de API/Worker

| Aspecto           | API / Worker                    | Web                             |
| ----------------- | ------------------------------- | ------------------------------- |
| Imagen runner     | node:20-alpine                  | nginx:alpine                    |
| Proceso           | `node dist/main.js`             | `nginx -g "daemon off;"`        |
| Variables         | ENV en run-time                 | ARG en build-time               |
| Puerto            | 3000 (TCP, NestJS)              | 80 (HTTP, nginx)                |
| Tamano imagen     | ~200MB                          | ~25MB                           |

## Pendientes no resueltos
- `.dockerignore` raiz — se crea en T-0421.
- Configuracion de variables por ambiente en CI/CD — Fase 6.
- Cabeceras CSP (Content-Security-Policy) en nginx — mejora de seguridad post-MVP.
