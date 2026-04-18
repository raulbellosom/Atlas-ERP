# T-0824 - Configurar i18n base

## Metadatos
- ID: `T-0824`
- Fase: `Fase 8`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/lib/i18n.js`:
  - Objeto de traducciones plano en español (solo `es` en esta fase).
  - Funcion `t(key)`: lookup por clave dotted (`"common.save"`, `"auth.login"`, etc.).
  - `formatDate(date)`: formato legible en es-MX (ej. "13 abr 2026").
  - `formatDateTime(date)`: fecha + hora completa.
  - `formatNumber(n)`: separadores de miles locales.
  - Sin dependencias externas; i18n completo diferido a Fase 9+.

## Criterios de aceptacion
- [x] `t()` y formatters disponibles en toda la app via import.
- [x] lint + build OK.
