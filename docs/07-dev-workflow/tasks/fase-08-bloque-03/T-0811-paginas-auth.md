# T-0811 - Configurar páginas de auth

## Metadatos
- ID: `T-0811`
- Fase: `Fase 8`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Objetivo
Implementar las páginas del flujo de autenticación.

## Alcance (implementado en Bloque 1)
- `src/pages/auth/LoginPage.jsx`:
  - Formulario con email + password.
  - Llama a `useAuthStore().login()` con `organizationId` de `env.defaultOrgId`.
  - Manejo de estado loading/error.
  - Redirect a ruta previa o `/dashboard` tras login exitoso.
  - Diseño centrado con card, labels, inputs con focus ring brand.

## Criterios de aceptacion
- [x] Login exitoso → redirect a /dashboard.
- [x] Credenciales inválidas → mensaje de error visible.
- [x] Campo password oculto con autoComplete.
- [x] lint + build OK.
