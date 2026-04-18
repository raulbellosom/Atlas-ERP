# T-0421 - Configurar política base de buckets

## Metadatos
- ID: `T-0421`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Definir la politica de acceso base para el bucket de MinIO/S3 de AtlasERP: acceso privado, sin URLs publicas, acceso solo via credenciales de la API.

## Criterios de aceptacion
- [x] Politica de acceso: privado (sin acceso anonimo).
- [x] Solo la API accede al bucket via credenciales S3 (`S3_ACCESS_KEY` / `S3_SECRET_KEY`).
- [x] URLs de descarga generadas via presigned URLs (temporales, con TTL).
- [x] Estructura de prefijos documentada (ver T-0420).
- [x] Sin CORS habilitado en esta fase (solo acceso server-side).
- [x] `.dockerignore` creado en la raiz del monorepo.

## Politica de acceso

### Acceso al bucket: PRIVADO
- El bucket `atlasrep-files` es privado — no hay acceso anonimo.
- Ningun archivo es accesible via URL publica directa.
- El acceso se realiza exclusivamente desde el backend (NestJS API).

### Presigned URLs
Para que el frontend descargue archivos, la API genera URLs temporales:
```
GET /api/files/:id/download
→ API genera presigned URL con TTL (e.g., 15 minutos)
→ Frontend redirige al usuario a la presigned URL
→ MinIO sirve el archivo directamente al browser
```
Ventajas:
- El archivo no pasa por la API (menor carga en el servidor).
- La URL expira automaticamente.
- Sin exponer credenciales al frontend.

### Sin CORS en esta fase
- Los uploads van via API (multipart/form-data → API → MinIO).
- Los downloads van via presigned URLs (browser → MinIO directamente).
- CORS en MinIO solo se necesita para uploads directos desde el browser (sin pasar por API).
- Se habilitara en Fase 5+ si se implementa direct upload.

## .dockerignore

Para optimizar el contexto de build de Docker y evitar enviar archivos innecesarios:

```
# .dockerignore (en la raiz del monorepo)
node_modules
.git
.gitignore
dist
*.md
.env
.env.*
!.env.example
.husky
coverage
*.log
.turbo
```

## Archivos creados
- `.dockerignore` (raiz del monorepo)

## Pendientes no resueltos
- Implementacion de presigned URLs en NestJS — Fase 5 (modulo Files).
- CORS configuration para direct upload — Fase 5+.
- ACLs de usuario en MinIO (usuario con permisos minimos para la API) — mejora post-MVP.
