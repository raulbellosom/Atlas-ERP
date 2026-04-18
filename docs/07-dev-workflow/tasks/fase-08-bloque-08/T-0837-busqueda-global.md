# T-0837 - Configurar búsqueda global base

## Metadatos
- ID: `T-0837`
- Fase: `Fase 8`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/hooks/useGlobalSearch.js`:
  - Recibe `items`, `matcher` y opciones `{ debounceMs }`.
  - Filtra localmente con debounce (default 200ms).
  - Retorna `{ query, setQuery, results, isSearching }`.
- `src/components/ui/SearchInput.jsx`:
  - Input con icono lupa a la izquierda y boton X para limpiar.
  - Compatible con `useGlobalSearch`.
- Integrado en `UsersPage` para validar funcionamiento end-to-end.

## Criterios de aceptacion
- [x] Filtrado reactivo con debounce en UsersPage.
- [x] Boton X limpia la busqueda.
- [x] lint + build OK.
