# T-0838 - Configurar manejo de errores de API en UI

## Metadatos
- ID: `T-0838`
- Fase: `Fase 8`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/lib/apiErrors.js`:
  - `getErrorMessage(err, fallback?)`: extrae mensaje legible de errores Axios, red y JS.
  - `getStatusCode(err)`: extrae HTTP status code.
  - `classifyError(err)`: clasifica en auth/forbidden/notFound/validation/server/network/unknown.
- `src/hooks/useApiError.js`:
  - `handleError(err, fallback?)`: llama `toast.error()` con el mensaje extraido.
  - Ignora errores 401 (los maneja el interceptor de Axios).
- `UsersPage` actualizada para usar `useApiError` + `Table` + `SearchInput` como prueba de integracion.

## Criterios de aceptacion
- [x] Errores de API aparecen como toast.error en la UI.
- [x] Errores 401 no generan toast (los maneja el interceptor).
- [x] lint + build OK.
