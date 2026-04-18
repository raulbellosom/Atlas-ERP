# T-0808 - Configurar estado global mínimo

## Metadatos
- ID: `T-0808`
- Fase: `Fase 8`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Objetivo
Implementar estado global mínimo con Zustand para sesión de usuario.

## Alcance (implementado en Bloque 1)
- `src/store/auth.store.js` con Zustand + `persist` middleware.
- Estado: `user`, `accessToken`, `refreshToken`, `isAuthenticated`.
- Acciones: `login()`, `logout()`, `setToken()`.
- Persistencia en localStorage bajo clave `atlas-auth`.

## Criterios de aceptacion
- [x] Estado persiste entre recargas de página.
- [x] login() guarda accessToken + refreshToken.
- [x] logout() limpia todos los campos y notifica al backend.
- [x] lint + build OK.
