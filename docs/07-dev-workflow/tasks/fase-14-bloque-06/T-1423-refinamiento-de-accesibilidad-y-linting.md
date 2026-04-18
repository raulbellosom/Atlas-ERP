# T-1423 - Refinamiento de accesibilidad y linting

## Metadatos
- ID: `T-1423`
- Fase: `Fase 14`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Auditar y corregir todos los problemas de accesibilidad (a11y) y linting en el módulo FinOps, asegurando cumplimiento con WCAG AA, navegación completa por teclado y ausencia de errores/warnings en el linter.

## Alcance
- Ejecutar `pnpm --filter @atlasrep/web run lint` y corregir todos los errores y warnings reportados.
- Auditar accesibilidad con `eslint-plugin-jsx-a11y`:
  - `aria-label` en todos los botones de icono (sin texto visible).
  - `aria-describedby` en campos de formulario con mensajes de error.
  - `role="alert"` en `ErrorState` y `OfflineBanner` para anuncio inmediato a screen readers.
  - Focus trap en modales (diálogos de confirmación, formularios en drawer).
  - Orden lógico de focus con `tabIndex` donde sea necesario.
- Verificar contraste de color (WCAG AA): badges, botones deshabilitados, texto de error.
- Garantizar que todos los elementos interactivos son alcanzables y activables por teclado.
- Corregir imports no utilizados y variables no usadas reportadas por ESLint.

## Fuera de alcance
- Auditoría con herramienta externa (Lighthouse, axe-core) — se hace en T-1426.
- Soporte de alto contraste del sistema operativo (Fase 15+).
- Internacionalización (i18n) de mensajes de aria (Fase 15+).

## Dependencias
- `T-1400` a `T-1422`: todo el módulo implementado.
- `eslint-plugin-jsx-a11y` configurado en el workspace web.

## Criterios de aceptación
- [x] `pnpm --filter @atlasrep/web run lint` sin errores ni warnings.
- [x] Todos los botones de icono tienen `aria-label`.
- [x] `ErrorState` y `OfflineBanner` tienen `role="alert"`.
- [x] Navegación por teclado funcional en modales y formularios.
- [x] `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: 0 errores, 0 warnings.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: navegar todo el módulo solo con teclado — todos los elementos alcanzables.

## Pruebas
- Tab a través de `BankAccountsPage` → tabla, botones, paginación alcanzables en orden lógico.
- Abrir modal de confirmación de eliminación → focus atrapado dentro del modal.
- Cerrar modal con `Escape` → focus regresa al botón que lo abrió.
- Screen reader (NVDA/macOS VoiceOver) en `ErrorState` → anuncia el error automáticamente.
- Botón con solo icono (ej. "Eliminar") → screen reader anuncia "Eliminar cuenta bancaria".

## Riesgos
- **Radix UI ya gestiona focus trap**: los componentes Dialog y Sheet de Radix UI incluyen focus trap. Solo es necesario verificar que no se haya anulado accidentalmente con `onInteractOutside`.

## Documentación a actualizar
- Archivos modificados durante la auditoría (correcciones inline, no archivos nuevos).
- Los cambios son dispersos por todos los componentes del módulo.

## Decisiones clave
- **Corrección en el origen, no parches globales**: cada problema de a11y se corrige en el componente responsable, no con un proveedor de contexto global que fuerce atributos. Esto mantiene los componentes autocontenidos.
- **`role="alert"` sobre `aria-live`**: `role="alert"` implica `aria-live="assertive"` que es el comportamiento correcto para errores de red y estado offline — anuncio inmediato sin espera.

## Evidencia documental
- No hay archivos nuevos — cambios inline en componentes existentes del módulo.

## Pendientes para la siguiente task
- `T-1424` genera el build de producción verificando que compila sin errores.

## Pendientes no resueltos
- Ninguno.
