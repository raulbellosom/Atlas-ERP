# Tables and Listings Skill

## ID de task origen

- `T-0127`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Guiar la creación de tablas y listados consistentes en el frontend de AtlasERP.

## Procedimiento

### 1. Estructura de tabla estándar

- Header con nombre de columnas y ordenamiento.
- Filas con datos, acciones por fila (ver, editar, eliminar).
- Footer con paginación.
- Barra de filtros encima de la tabla.
- Indicador de total de registros.

### 2. Paginación

- Controlada desde el servidor (no paginación solo en cliente).
- Parámetros: `page`, `limit` (valores por defecto: page=1, limit=20).
- Mostrar: "Mostrando X-Y de Z registros".
- Controles: anterior, siguiente, ir a página.

### 3. Filtros

- Filtros visibles para campos principales.
- Botón de filtros avanzados para campos secundarios.
- Aplicar filtros con debounce para búsqueda de texto.
- Filtros persistentes en URL (querystring) para poder compartir/restaurar.

### 4. Ordenamiento

- Click en header de columna para ordenar.
- Indicador visual de dirección (ascendente/descendente).
- Ordenamiento enviado al servidor.

### 5. Estados obligatorios

- **Loading**: skeleton rows o spinner.
- **Empty**: mensaje con icono y acción sugerida.
- **Error**: mensaje con opción de reintentar.
- **No results (con filtros activos)**: "No se encontraron resultados. Intenta otros filtros."

### 6. Acciones por fila

- Botones de acción discretos (iconos con tooltip).
- Menú contextual para múltiples acciones.
- Confirmación para acciones destructivas (modal de confirmación).

### 7. Responsive

- En pantallas pequeñas: tabla scrollable horizontal o vista de cards.
- Priorizar columnas más importantes en vista compacta.

### 8. Stack

- Componente base de tabla desde `packages/ui`.
- TailwindCSS 4.1 para estilos.
- React Query para data fetching.

## Referencia

- `docs/00-canon/05_ui_principles.md`
- `docs/02-architecture/05-naming-componentes-ui.md`
