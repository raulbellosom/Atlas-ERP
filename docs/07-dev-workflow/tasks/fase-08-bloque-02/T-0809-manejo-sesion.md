# T-0809 - Configurar manejo de sesión

## Metadatos
- ID: `T-0809`
- Fase: `Fase 8`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Objetivo
Implementar renovación automática de access token cuando expira (401 → refresh → retry).

## Alcance
- Actualizar `src/store/auth.store.js`:
  - Estado: añadir `refreshToken: null`.
  - `login()`: guarda `refreshToken` de la respuesta del backend.
  - `logout()`: limpia también `refreshToken`.
  - `partialize`: incluir `refreshToken` en la persistencia.
- Actualizar `src/api/client.js`:
  - Helpers `readAuthState()`, `writeAuthState(patch)`, `clearAuthState()` — leen/escriben en localStorage directamente para evitar dependencia circular con el store.
  - En el response interceptor:
    - En 401 (no es `/v1/auth/refresh`, no tiene `_retried`):
      1. Si hay otro refresh en curso (`_isRefreshing`), encolar en `_refreshQueue`.
      2. Leer `refreshToken` de localStorage.
      3. Si no hay refreshToken → `clearAuthState()` + redirect `/login`.
      4. `POST /v1/auth/refresh` con `{ refreshToken }`.
      5. Éxito: `writeAuthState({ accessToken })` + `processQueue(null, token)` + retry request original.
      6. Falla: `clearAuthState()` + redirect `/login`.
  - `normalizeError()` para compatibilidad con errores ya normalizados en la cola.

## Resultados
- Token expirado → request falla 401 → refresh automático → request reintentado sin intervención del usuario.
- Múltiples requests simultáneos con 401 se encolan y se resuelven con un solo refresh.
- Refresh fallido → limpieza de sesión + redirect automático a /login.

## Criterios de aceptacion
- [x] refreshToken guardado en localStorage en login.
- [x] 401 interceptado y refresh ejecutado automáticamente.
- [x] Cola de requests durante refresh funcionando.
- [x] Redirect a /login en refresh fallido.
- [x] lint + build OK.

## Notas técnicas
- `_isRefreshing` y `_refreshQueue` son variables de módulo (no estado React) para evitar re-renders.
- `window.location.href = "/login"` es seguro aquí ya que es un reset de sesión completo.
