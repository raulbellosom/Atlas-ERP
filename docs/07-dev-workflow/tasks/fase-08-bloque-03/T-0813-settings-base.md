# T-0813 - Configurar módulo visual de settings base

## Metadatos
- ID: `T-0813`
- Fase: `Fase 8`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Objetivo
Implementar la página de settings con perfil del usuario autenticado.

## Alcance
- `src/pages/settings/SettingsPage.jsx`:
  - `useQuery` → `GET /v1/auth/me` para cargar perfil.
  - Fallback al `user` del store mientras carga.
  - Muestra: email, displayName, ID (mono), estado (Activo/Bloqueado/Inactivo).
  - Card con `dl` / `dt` / `dd` para campos de perfil.
  - Estados: loading, error, data.
- Ruta añadida: `/settings` en `App.jsx`.
- Nav item "Configuración" añadido en `Sidebar.jsx`.

## Criterios de aceptacion
- [x] Página carga datos reales de /v1/auth/me.
- [x] Estado de carga y error manejados.
- [x] lint + build OK.
