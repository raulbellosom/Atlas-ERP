# T-1109 — Sistema de tablas — reescritura completa

## Metadata
- **Fase**: 11
- **Bloque**: 2
- **Estado**: CERRADA
- **Fecha de cierre**: 2026-04-14
- **Archivo**: `apps/web/src/components/ui/Table.jsx` (reescritura completa)

## Descripcion
Reescritura completa de Table.jsx con capacidades de ordenamiento, seleccion de filas,
cabecera sticky y estado vacio cartografico. La tabla es el componente mas usado en un ERP
y necesita la mayor atencion al detalle de todo el design system.

## Nuevas capacidades

### Ordenamiento de columnas
- Estado local `sortKey` + `sortDir` ('asc'|'desc')
- Columnas sortables por prop `sortable: true` en definicion
- Soporte `sortValue(row)` para ordenamiento por valor transformado
- Indicador visual: dos agujas del compas (triangulos SVG)
  - Aguja activa: amber-500 (laton del compas)
  - Aguja inactiva: border-strong (gris sutil)
- `aria-sort` en `<th>` para accesibilidad
- Ordenamiento localeCompare con numeric: true para strings con numeros

### Seleccion de filas
- `selectable` prop habilita columna de checkboxes
- `selectedKeys` + `onSelectionChange` para control externo
- Checkbox propio (sin libreria):
  - ink-600 cuando checked (autoridad del sistema)
  - Icono SVG de checkmark propio (9x7 px)
  - indeterminate: guion blanco horizontal
  - group-hover para feedback en label wrapper
- Fila seleccionada: bg-ink-50 (azul muy sutil)
- Seleccion total en header con allSelected / someSelected

### Cabecera sticky
- `stickyHeader` prop: `sticky top-0 z-10`
- Compatible con contenedores con overflow-y

### Estado vacio cartografico
El estado vacio reemplaza el EmptyState generico con una experiencia
especifica de AtlasERP:

**SVG** (100x76 viewBox):
- Rectangulo de mapa con rx=4 en ink-50 con borde ink-200
- 6 lineas de meridianos verticales (strokeDasharray 2 3)
- 6 paralelos horizontales (strokeDasharray 2 3)
- Rosa de los vientos centrada:
  - Norte: path triangular en amber-500 (laton del compas)
  - Sur/Este/Oeste: ink-300
  - Circulo central: amber-400 / amber-700
- 5 nodos de territorio inexplorado: circulos ink-200

Titulo: `emptyTitle` (default: "Territorio sin cartografiar")
Descripcion: `emptyDescription` (default: "No hay registros en este dominio todavia.")

### Correcciones respecto a version anterior
- `<TableRowSkeleton>` llamado una sola vez con `cols={colCount} rows={5}`
  (version anterior creaba 5 instancias x 5 filas = 25 skeleton rows)
- `colCount` incluye columna de checkbox cuando `selectable=true`

## Columna definition API

```javascript
const columns = [
  {
    key: "email",
    header: "Email",
    sortable: true,
    align: "left",            // "left" | "center" | "right"
    width: "200px",           // opcional
    sortValue: (row) => row.email.toLowerCase(),  // opcional
    render: (row) => <span className="font-mono">{row.email}</span>,
  },
];
```

## Criterio de terminado
- [x] Ordenamiento local con SortChevrons en amber/inactivo
- [x] Seleccion de filas con Checkbox propio y control externo
- [x] Cabecera sticky con prop stickyHeader
- [x] Estado vacio SVG cartografico (rosa de los vientos)
- [x] onRowClick con cursor-pointer por fila
- [x] API retro-compatible (columns/data/isLoading/emptyTitle/keyField)
- [x] aria-sort en th para accesibilidad
- [x] Build sin errores, sin warnings de Tailwind
