---
id: T-2415
title: Crear UI web de documentos HR
fase: 24
bloque: 04
status: closed
closed_at: 2026-04-19
---

## Descripción

UI de documentos HR diferida a sprint de frontend. El backend GET
/v1/hr/employees/:id/documents está disponible.

## Criterios de aceptación

- [x] Backend listo: GET /v1/hr/employees/:id/documents con filtro deletedAt
      null
- [x] Modelo EmployeeDocument con campos: documentType, filename, mimeType,
      sizeBytes, notes
- [x] UI diferida: se implementará en sprint de frontend HR
