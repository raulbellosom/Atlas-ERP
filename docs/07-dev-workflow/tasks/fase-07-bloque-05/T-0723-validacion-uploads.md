# T-0723 - Documentar validación de archivos subidos

## Metadatos
- ID: `T-0723`
- Fase: `Fase 7`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Documentar la validación de archivos ya implementada en `file-security.util.ts`, confirmando que cumple los requisitos de seguridad para uploads.

## Alcance
- Revisión de `apps/api/src/modules/attachments/utils/file-security.util.ts`.
- Confirmar que `validateIncomingFile()` valida:
  - Presencia del archivo (lanza si `file` es undefined).
  - Tamaño máximo (lanza si `sizeBytes > MAX_FILE_SIZE`).
  - MIME type contra allowlist (lanza si no está en lista).
  - Extensión contra allowlist (lanza si no está en lista).
- Confirmar que `buildStorageObjectKey()` genera paths con UUID para evitar path traversal.

## Resultados
- Validación completa ya existía antes de esta tarea.
- No se requirió código nuevo — solo verificación y cierre.

## Criterios de aceptacion
- [x] validateIncomingFile() verifica archivo, tamaño, MIME y extensión.
- [x] buildStorageObjectKey() genera paths con UUID (no usa nombre original del archivo como path).
- [x] `lint` + `typecheck` + `build` OK (sin cambios de código).

## Fuera de alcance
- Escaneo antivirus de archivos.
- Validación de contenido interno (magic bytes avanzados).

## Dependencias
- Implementado previamente en bloque de storage (Fase 5/6).
