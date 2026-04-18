# T-1106 — Sistema de botones (xs size)

## Metadata
- **Fase**: 11
- **Bloque**: 2
- **Estado**: CERRADA
- **Fecha de cierre**: 2026-04-14
- **Archivo**: `apps/web/src/components/ui/Button.jsx`

## Descripcion
Agregar el tamano `xs` al sistema de botones para acciones de alta densidad:
filas de tabla, toolbars compactas, inline actions en paneles laterales.

## Cambios implementados

### Nuevo size `xs`
```javascript
xs: "h-6 px-2 text-xs gap-1",
```
- Altura 24px (h-6) — el minimo funcional con area de click aceptable
- px-2 para presencia horizontal minima
- gap-1 cuando se usan iconos

### JSDoc actualizado
El bloque de parametros ahora lista: `'xs'|'sm'|'md'|'lg'`

## Uso tipico
```jsx
<Button variant="ghost" size="xs">Ver detalle</Button>
<Button variant="danger" size="xs" iconLeft={<TrashIcon />}>Eliminar</Button>
```

## Criterio de terminado
- [x] Nuevo size xs compila y renderiza
- [x] Escala visualmente coherente con sm (h-7), md (h-9), lg (h-11)
- [x] Build sin errores
