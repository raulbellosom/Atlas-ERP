# T-0645 - Probar backend foundation end-to-end

## Metadatos
- ID: `T-0645`
- Fase: `Fase 6`
- Bloque: `Bloque 10`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Ejecutar smoke test completo del backend contra los servicios Docker reales (PostgreSQL, MinIO) para verificar que todos los módulos arrancan y los endpoints base responden correctamente.

## Alcance
- Levantar PostgreSQL, Redis, MinIO vía `docker compose -f infra/docker/docker-compose.dev.yml up -d`.
- Ejecutar migraciones con `db:migrate`.
- Arrancar la API compilada (`node dist/main.js`).
- Verificar respuestas de:
  - `GET /api/health` → 200 `{status: 'ok'}`
  - `GET /api/v1/auth/status` → 200 con `sessionManagement: 'ready'`
  - `GET /api/v1/auth/me` (sin token) → 401
  - `GET /api/v1/auth/me` (Bearer) → 501
  - `POST /api/v1/auth/login` → 501 (stub)
  - `POST /api/v1/auth/refresh` → 501 (stub)
  - `GET /api/v1/organizations` (Bearer) → 200 con datos de seed
  - `GET /api/v1/organizations/:id/branches` (Bearer) → 200 array vacío
  - `GET /api/v1/roles` (Bearer) → 200 con 3 roles seeded
  - `GET /api/v1/roles/:id/permissions` (Bearer) → 200 con 13 permisos del admin
  - `GET /api/v1/permissions` (Bearer) → 200 con 13 permisos
  - `GET /api/v1/settings` (Bearer) → 200 con settings seeded
  - `GET /api/v1/audit/logs` (Bearer) → 200 array vacío

## Resultados del smoke test
- `GET /api/health` ✅ → `{"data":{"status":"ok","timestamp":"...","uptime":...},"meta":{...}}`
- `GET /api/v1/auth/status` ✅ → `{"data":{"module":"auth","status":"configured","authStrategy":"pending-phase-7","sessionManagement":"ready",...},...}`
- `GET /api/v1/auth/me` (sin token) ✅ → `{"statusCode":401,"code":"UNAUTHORIZED","message":"Token de acceso requerido",...}`
- `GET /api/v1/auth/me` (Bearer) ✅ → `{"statusCode":501,"code":"INTERNAL_ERROR","message":"El perfil del usuario autenticado requiere decodificación JWT, disponible en Fase 7.",...}`
- `POST /api/v1/auth/login` ✅ → `{"statusCode":501,...,"message":"Login con credenciales para ... se implementa en Fase 7.",...}`
- `POST /api/v1/auth/refresh` ✅ → `{"statusCode":501,...,"message":"Refresh de token se implementa en Fase 7...",...}`
- `GET /api/v1/organizations` ✅ → 1 org seeded (AtlasERP Demo)
- `GET /api/v1/organizations/:id/branches` ✅ → `[]`
- `GET /api/v1/roles` ✅ → 3 roles (admin, tesorero, auditor) con permissionCount y userCount
- `GET /api/v1/roles/:id/permissions` ✅ → 13 permisos del rol admin
- `GET /api/v1/permissions` ✅ → 13 permisos seeded
- `GET /api/v1/settings` ✅ → 8 settings (plataforma + organización)
- `GET /api/v1/audit/logs` ✅ → `[]`

## Criterios de aceptación
- [x] Todos los endpoints del golden path responden correctamente.
- [x] Errores de autenticación retornan 401 (sin token) o 501 (con token pero stub).
- [x] Datos de seed visibles en organizaciones, roles, permisos, settings.
- [x] Sin errores de inicio en `NestApplication`.
- [x] StorageService conecta a MinIO y crea el bucket si no existe.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Fuera de alcance
- Test de carga o performance.
- Test de attachments con upload real.

## Dependencias
- `T-0644` cerrada.

## Pendientes no resueltos
- Ninguno.
