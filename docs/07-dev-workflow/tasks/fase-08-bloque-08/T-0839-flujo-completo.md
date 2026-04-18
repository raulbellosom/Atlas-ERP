# T-0839 - Probar frontend foundation en flujo completo

## Metadatos
- ID: `T-0839`
- Fase: `Fase 8`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
Prueba de integracion de todos los componentes de Fase 8 en `UsersPage`:
- `Table` con columnas configurables, loading skeleton y empty state.
- `Badge` con variantes semanticas (verde/gris/rojo).
- `SearchInput` + `useGlobalSearch` con debounce.
- `useApiError` que convierte errores Axios en toasts.
- `formatDate` de `i18n.js` para fechas.

## Criterios de aceptacion
- [x] UsersPage usa los nuevos componentes base en lugar de HTML raw.
- [x] Busqueda filtra la lista en tiempo real.
- [x] Error de API muestra toast.
- [x] lint + build OK (177 modulos — incluye todos los nuevos).
