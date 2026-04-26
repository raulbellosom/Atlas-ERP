# Estrategia de Release del Frontend Web â€” AtlasERP

**VersiÃ³n:** 1.0
**Fecha:** 2026-04-18
**Task origen:** T-1917 (Fase 19 Bloque 4)

---

## VisiÃ³n general

El frontend web (React + Vite) se distribuye como un conjunto de archivos estÃ¡ticos (`dist/`) servidos por nginx. El build de Vite genera automÃ¡ticamente nombres de archivo con hash de contenido (e.g., `main-abc123.js`), lo que permite cache-busting automÃ¡tico sin configuraciÃ³n adicional.

---

## Ciclo de vida de un release de frontend

### 1. Build de producciÃ³n

```bash
VITE_API_URL=https://api.atlaserp.com \
VITE_ENV=production \
VITE_APP_VERSION=$GIT_SHA \
pnpm --filter @atlaserp/web run build
```

Salida: `apps/web/dist/` con:
- `index.html` â€” punto de entrada (sin hash, sin cache)
- `assets/main-[hash].js` â€” bundle principal (con hash, cache 1 aÃ±o)
- `assets/[chunk]-[hash].js` â€” chunks divididos (con hash)
- `assets/[name]-[hash].css` â€” estilos

### 2. Estrategia de versiones

| Canal | Trigger | Tag | Ambiene |
|-------|---------|-----|---------|
| Staging | Merge a `main` | `sha-{commit}` | `staging` |
| ProducciÃ³n | Tag `v*.*.*` o `workflow_dispatch` | `v1.2.3` | `production` |

### 3. DistribuciÃ³n

**OpciÃ³n A â€” Imagen Docker con nginx** (configurada en `apps/web/Dockerfile`):
- La imagen Docker se construye con el build de Vite incluido.
- Se despliega como contenedor en el servidor.
- El servidor nginx sirve los archivos estÃ¡ticos.

**OpciÃ³n B â€” Archivos estÃ¡ticos en servidor**:
- Los archivos de `dist/` se sincronizan al servidor con `rsync` o `scp`.
- nginx ya configurado sirve desde `/var/www/atlaserp/`.

### 4. InvalidaciÃ³n de cachÃ©

Vite genera hashes Ãºnicos por contenido. Al hacer release:
- Los archivos nuevos tienen hashes nuevos â†’ se descargan automÃ¡ticamente.
- Los archivos sin cambios mantienen su hash â†’ se sirven desde cachÃ© del navegador.
- `index.html` nunca se cachea (`Cache-Control: no-store`) â†’ siempre apunta a los assets nuevos.

No se requiere invalidaciÃ³n de cachÃ© CDN en v1 (sin CDN).

### 5. Zero-downtime deploy

El frontend es estÃ¡tico â€” el servidor nginx puede ser actualizado sin downtime:

```bash
# Parar contenedor anterior
docker stop atlaserp-web

# Iniciar nuevo contenedor con la nueva imagen
docker run -d --name atlaserp-web \
  -p 80:80 \
  ghcr.io/{org}/atlaserp-web:v1.2.3

# El gap entre stop y start es < 1 segundo
```

Para downtime 0 real: usar nginx con mÃºltiples upstreams (blue/green) â€” Fase 22+.

### 6. Variables de entorno de Vite

Las variables `VITE_*` se **incrustan** en el bundle en tiempo de build. No son variables de runtime. Esto significa:

- `VITE_API_URL` apunta a la URL del backend en el momento del build.
- Si la URL del backend cambia, se necesita un nuevo build del frontend.
- **Nunca** almacenar secretos en variables `VITE_*` â€” estÃ¡n expuestas en el bundle JS.

### 7. Compatibilidad con el backend

El frontend debe ser compatible con la versiÃ³n del backend que tiene desplegada. En v1:

- El frontend y el backend se liberan en coordinaciÃ³n (misma versiÃ³n semÃ¡ntica).
- Si el backend tiene breaking changes en la API, el frontend debe actualizarse en el mismo release.
- En el futuro: versionado de API (`/api/v1/`, `/api/v2/`) para desacoplar releases.

---

## Rollback

El rollback del frontend es simple â€” redesplegar la versiÃ³n anterior:

```bash
docker run -d --name atlaserp-web \
  -p 80:80 \
  ghcr.io/{org}/atlaserp-web:v1.1.0
```

O en estÃ¡ticos: restaurar el directorio `dist/` desde el artefacto anterior en GitHub Actions.

---

## Referencias

- Workflow de build: `.github/workflows/build-frontend.yml`
- Workflow de deploy staging: `.github/workflows/deploy-staging.yml`
- Workflow de deploy prod: `.github/workflows/deploy-prod.yml`
- nginx config: `apps/web/nginx.conf`

