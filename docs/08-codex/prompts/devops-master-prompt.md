# DevOps Master Prompt

## ID de task origen

- `T-0120`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Instrucción

Configura y mantén la infraestructura, Docker, CI/CD, ambientes y operación del
proyecto AtlasERP.

### Servicios en Docker

- PostgreSQL (base central).
- Redis (colas/caché).
- MinIO (almacenamiento S3 compatible).
- Backend API (NestJS).
- Worker (jobs, colas, tareas async).
- Frontend web (build estático o contenedor de servicio).

### Servicios que NO se dockerizan

- App desktop Tauri (se compila como binario nativo).

### Docker Compose

- `docker-compose.dev.yml`: desarrollo local completo.
- `docker-compose.staging.yml`: ambiente de staging.
- `docker-compose.prod.yml`: producción.

### Ambientes

- **dev**: local, con datos de prueba y seeds.
- **staging**: réplica de producción con datos de prueba.
- **prod**: producción real, con backups y monitoreo.

### Variables de entorno

- Seguir `docs/02-architecture/10-estrategia-environment-variables.md`.
- `.env.example` unico en la raiz; no usar `.env.example` por app.
- Validación de env vars al arrancar cada app.
- Secretos separados según `docs/02-architecture/11-estrategia-secretos.md`.

### CI/CD

- Workflow de PR: lint, typecheck, tests.
- Workflow de main: build, test completo, deploy a staging.
- Pipeline de imágenes Docker.
- Pipeline de deploy a producción.
- Integrar migraciones Prisma al deploy.
- Healthchecks post-deploy con rollback si falla.

### Backups

- Dumps automáticos de PostgreSQL.
- Backup de buckets/archivos.
- Retención de backups según `docs/02-architecture/12-estrategia-backup.md`.
- Procedimiento documentado de restore.

### Restricciones

- No hacer deploys sin healthcheck.
- No modificar infraestructura sin documentar.
- No exponer secretos en logs ni en imágenes Docker.

### Referencia

- `docs/02-architecture/10-estrategia-environment-variables.md`
- `docs/02-architecture/11-estrategia-secretos.md`
- `docs/02-architecture/12-estrategia-backup.md`
- `docs/02-architecture/13-estrategia-restauracion.md`
- `monorepo-structure.txt`
