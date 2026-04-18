# T-1105 — Sistema de badges (xs size + territory variant)

## Metadata
- **Fase**: 11
- **Bloque**: 2
- **Estado**: CERRADA
- **Fecha de cierre**: 2026-04-14
- **Archivo**: `apps/web/src/components/ui/Badge.jsx`

## Descripcion
Mejorar el sistema de badges del Design System Meridian con nuevo tamano compacto (`xs`)
y variante cartografica `territory` que encarna la identidad de «El Compas del Navegante».

## Cambios implementados

### Nuevo size `xs`
```
px-1 py-px text-[0.625rem] leading-4
```
Ideal para tablas densas y chips dentro de otros componentes donde `sm` todavia resulta grande.

### Nueva variant `territory`
```
bg-ink-900 text-amber-300 ring-1 ring-inset ring-ink-700
```
Laton del compas sobre ocean navy profundo. Semantica: hito destacado en el mapa del negocio.
Uso tipico: registros marcados, estados especiales de entidad, indicadores de ubicacion modular.

### Ajustes adicionales
- `dotSizes` separados por size: `xs` usa `w-1 h-1`, `sm/md` usan `w-1.5 h-1.5`
- `gaps` separados por size: `xs/sm` gap-1, `md` gap-1.5
- `radii` separados: `xs` rounded-[0.1875rem], `sm/md` rounded-sm

## Criterio de terminado
- [x] Nuevo size xs renderiza correctamente
- [x] Variant territory visible en contexto navy-on-dark
- [x] Dot en xs ajustado a w-1 h-1
- [x] Build sin errores
