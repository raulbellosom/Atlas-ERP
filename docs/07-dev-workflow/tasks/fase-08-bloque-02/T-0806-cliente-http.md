# T-0806 - Configurar cliente HTTP/API

## Metadatos
- ID: `T-0806`
- Fase: `Fase 8`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Objetivo
Configurar Axios como cliente HTTP con interceptors de request y response.

## Alcance (implementado en Bloque 1 + ampliado en Bloque 2)
- `src/api/client.js` con `axios.create({ baseURL: env.apiUrl, timeout: 15_000 })`.
- Request interceptor: lee `accessToken` de localStorage y adjunta `Authorization: Bearer`.
- Response interceptor: normaliza errores de API en `{ status, code, message, raw }`.
- T-0809: ampliado con interceptor de refresh (ver T-0809).

## Criterios de aceptacion
- [x] baseURL configurada desde VITE_API_URL.
- [x] Authorization header inyectado automáticamente.
- [x] Errores normalizados con code y message.
- [x] lint + build OK.
