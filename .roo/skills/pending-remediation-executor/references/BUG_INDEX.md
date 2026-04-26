# Bug Index - Pending Remediation Matrix

## Overview

18 bugs pending remediation, organized by risk category and execution priority.

## Security/Platform Hardening (10 bugs)

| Task ID | Title                                             | Owner           | App     | Source File                                                                           |
| ------- | ------------------------------------------------- | --------------- | ------- | ------------------------------------------------------------------------------------- |
| T-0632  | Configurar módulo de archivos con MinIO           | BackendAPIAgent | API     | docs/07-dev-workflow/tasks/fase-06-bloque-07/T-0632-modulo-archivos-minio.md          |
| T-0633  | Configurar subida segura de archivos              | BackendAPIAgent | API     | docs/07-dev-workflow/tasks/fase-06-bloque-07/T-0633-subida-segura-archivos.md         |
| T-0634  | Configurar descargas seguras de archivos          | BackendAPIAgent | API     | docs/07-dev-workflow/tasks/fase-06-bloque-07/T-0634-descarga-segura-archivos.md       |
| T-0905  | Configurar almacenamiento local seguro            | DesktopAgent    | Desktop | docs/07-dev-workflow/tasks/fase-09-bloque-02/T-0905-almacenamiento-local-seguro.md    |
| T-0908  | Configurar bridge de impresión/exportación        | DesktopAgent    | Desktop | docs/07-dev-workflow/tasks/fase-09-bloque-02/T-0908-bridge-impresion-exportacion.md   |
| T-0910  | Configurar bridge de actualizaciones futuras      | DesktopAgent    | Desktop | docs/07-dev-workflow/tasks/fase-09-bloque-03/T-0910-bridge-actualizaciones-futuras.md |
| T-0914  | Configurar repositorios locales para cola de sync | DesktopAgent    | Desktop | docs/07-dev-workflow/tasks/fase-09-bloque-03/T-0914-repositorios-locales-cola-sync.md |
| T-0916  | Configurar arranque desktop autenticado           | DesktopAgent    | Desktop | docs/07-dev-workflow/tasks/fase-09-bloque-04/T-0916-arranque-desktop-autenticado.md   |
| T-0917  | Configurar arranque desktop offline               | DesktopAgent    | Desktop | docs/07-dev-workflow/tasks/fase-09-bloque-04/T-0917-arranque-desktop-offline.md       |
| T-0722  | Rate limiting en endpoints de autenticación       | BackendAPIAgent | API     | docs/07-dev-workflow/tasks/fase-07-bloque-05/T-0722-rate-limit-guard.md               |

## Auth/Scope/Data Correctness (3 bugs)

| Task ID | Title                                           | Owner           | App | Source File                                                                             |
| ------- | ----------------------------------------------- | --------------- | --- | --------------------------------------------------------------------------------------- |
| T-0625  | Configurar decorators de organización/sucursal  | BackendAPIAgent | API | docs/07-dev-workflow/tasks/fase-06-bloque-06/T-0625-decorators-organizacion-sucursal.md |
| T-0706  | Implementar registro de devices                 | BackendAPIAgent | API | docs/07-dev-workflow/tasks/fase-07-bloque-02/T-0706-registro-devices.md                 |
| T-1019  | Implementar persistencia backend de SyncSession | BackendAgent    | API | docs/07-dev-workflow/tasks/fase-10-bloque-04/T-1019-persistencia-sync-session.md        |

## Foundation Consistency/UX Debt (5 bugs)

| Task ID | Title                                        | Owner            | App     | Source File                                                                |
| ------- | -------------------------------------------- | ---------------- | ------- | -------------------------------------------------------------------------- |
| T-0619  | Configurar módulo Attachments                | BackendAPIAgent  | API     | docs/07-dev-workflow/tasks/fase-06-bloque-04/T-0619-modulo-attachments.md  |
| T-0628  | Configurar paginación base                   | BackendAPIAgent  | API     | docs/07-dev-workflow/tasks/fase-06-bloque-06/T-0628-paginacion-base.md     |
| T-0629  | Configurar filtros base                      | BackendAPIAgent  | API     | docs/07-dev-workflow/tasks/fase-06-bloque-06/T-0629-filtros-base.md        |
| T-0814  | Configurar módulo visual de users/roles base | FrontendWebAgent | Web     | docs/07-dev-workflow/tasks/fase-08-bloque-03/T-0814-users-roles-base.md    |
| T-0902  | Configurar build local desktop               | DesktopAgent     | Desktop | docs/07-dev-workflow/tasks/fase-09-bloque-01/T-0902-build-local-desktop.md |

## Execution Priority Order

1. T-0632 (MinIO) → T-0633 (upload) → T-0634 (download)
2. T-0625 (decorators) → T-0706 (devices) → T-1019 (SyncSession)
3. T-0619 (Attachments) → T-0628 (pagination) → T-0629 (filters)
4. T-0902 (desktop build) → T-0905 (secure storage) → T-0908 (export/print) →
   T-0910 (updater) → T-0914 (sync queue) → T-0916 (auth boot) → T-0917 (offline
   boot)
5. T-0814 (users/roles UI)
6. T-0722 (rate limiting)

## App Mapping

- **API (NestJS)**: T-0619, T-0625, T-0628, T-0629, T-0632, T-0633, T-0634,
  T-0706, T-0722, T-1019
- **Web (React)**: T-0814
- **Desktop (Tauri)**: T-0902, T-0905, T-0908, T-0910, T-0914, T-0916, T-0917
- **Worker (NestJS/BullMQ)**: None in current matrix
