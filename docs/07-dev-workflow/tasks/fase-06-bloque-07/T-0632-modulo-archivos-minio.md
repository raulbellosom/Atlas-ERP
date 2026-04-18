# T-0632 - Configurar módulo de archivos con MinIO

## Metadatos
- ID: `T-0632`
- Fase: `Fase 6`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar la capa de infraestructura de archivos para MinIO/S3 compatible, reutilizable por módulos de backend.

## Alcance
- Instalar cliente MinIO en `apps/api`.
- Crear `StorageModule` y `StorageService` en `infrastructure/storage`.
- Inicializar cliente S3/MinIO desde variables de entorno:
  - `S3_ENDPOINT`
  - `S3_ACCESS_KEY`
  - `S3_SECRET_KEY`
  - `S3_BUCKET`
  - `S3_REGION`
- Validar bucket al arranque (creación automática si no existe).
- Soportar `S3_PUBLIC_URL` para URLs firmadas consumibles por navegador.

## Fuera de alcance
- CORS en bucket para direct-upload browser.
- Replicación multi-bucket o políticas de lifecycle avanzadas.

## Dependencias
- `T-0631` cerrada.

## Criterios de aceptación
- [x] Infraestructura MinIO operativa y reusable desde backend.
- [x] Servicio de storage con upload, verificación de existencia y presigned URLs.
- [x] Variables de entorno actualizadas (`.env.example`, referencia de env vars).
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/infrastructure/storage/storage.module.ts`
- `apps/api/src/infrastructure/storage/storage.service.ts`
- `apps/api/src/modules/app/app.module.ts`
- `apps/api/.env.example`
- `docs/02-architecture/18-referencia-env-vars.md`

## Pendientes no resueltos
- Endurecer políticas de bucket y CORS por ambiente en fase de hardening.
