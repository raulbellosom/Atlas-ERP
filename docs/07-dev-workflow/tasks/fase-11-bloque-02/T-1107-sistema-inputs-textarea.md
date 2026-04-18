# T-1107 — Sistema de inputs — Textarea.jsx

## Metadata
- **Fase**: 11
- **Bloque**: 2
- **Estado**: CERRADA
- **Fecha de cierre**: 2026-04-14
- **Archivo**: `apps/web/src/components/ui/Textarea.jsx` (nuevo)

## Descripcion
Crear el componente Textarea con la misma API de Input para consistencia total
en formularios del sistema. Necesario para campos de notas, descripciones y
razon de rechazo en flujos de conflicto de sincronizacion.

## API del componente

```jsx
<Textarea
  label="Notas"
  helpText="Hasta 500 caracteres"
  rows={4}
  resize="vertical"
  required
/>

<Textarea
  label="Motivo de rechazo"
  error="Campo obligatorio al rechazar"
  resize="none"
/>
```

## Props especificas
| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| rows | number | 4 | Altura inicial del textarea |
| resize | 'none'\|'vertical'\|'both' | 'vertical' | Control de redimensionamiento |

## Props heredadas de Input
- label, error, helpText, id, required
- forwardRef compatible con react-hook-form
- aria-invalid, aria-describedby para accesibilidad

## Criterio de terminado
- [x] forwardRef funciona con react-hook-form register()
- [x] label/error/helpText con misma presentacion que Input
- [x] Anillos de foco shadow-focus / shadow-focus-error
- [x] resize: none/vertical/both mapeado a clases Tailwind
- [x] Build sin errores
