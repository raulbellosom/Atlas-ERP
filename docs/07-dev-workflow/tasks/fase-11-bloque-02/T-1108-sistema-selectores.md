# T-1108 — Sistema de selectores — Select.jsx

## Metadata
- **Fase**: 11
- **Bloque**: 2
- **Estado**: CERRADA
- **Fecha de cierre**: 2026-04-14
- **Archivo**: `apps/web/src/components/ui/Select.jsx` (nuevo)

## Descripcion
Crear componente Select con elemento nativo para accesibilidad completa
y navegacion por teclado sin overhead de JavaScript de terceros.
El chevron evoca la aguja del compas del logo AtlasERP.

## Principio de diseno
Select nativo > select custom:
- Accesibilidad sin costo (lector de pantalla, teclado)
- Sin posicion de dropdown que calcular
- Sin portal/z-index issues en modales
- Funciona en todos los browsers sin polyfill

La identidad visual se consigue con `appearance-none` + estilos propios.

## API del componente

```jsx
<Select
  label="Estado"
  placeholder="Seleccionar estado..."
  options={[
    { value: "active", label: "Activo" },
    { value: "inactive", label: "Inactivo" },
    { value: "draft", label: "Borrador", disabled: true },
  ]}
  value={status}
  onChange={(e) => setStatus(e.target.value)}
/>

<Select
  label="Tipo"
  error="Requerido"
  leadingIcon={<FilterIcon />}
  options={typeOptions}
/>
```

## Chevron del compas
SVG propio (14x14) con path `M3 5L7 9L11 5` — aguja direccional minimalista.
Color `text-text-disabled`, pointer-events none.

## Criterio de terminado
- [x] Select nativo estilizado con appearance-none
- [x] Chevron SVG propio en posicion absolute derecha
- [x] label/error/helpText/leadingIcon con misma presentacion que Input
- [x] Anillos de foco semanticos (shadow-focus / shadow-focus-error)
- [x] options[] con { value, label, disabled? }
- [x] placeholder como option value="" disabled
- [x] forwardRef compatible con react-hook-form
- [x] Build sin errores
