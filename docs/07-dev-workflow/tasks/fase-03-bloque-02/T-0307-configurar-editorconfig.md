# T-0307 - Configurar EditorConfig

## Metadatos
- ID: `T-0307`
- Fase: `Fase 3`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Crear el archivo `.editorconfig` raíz del monorepo para que todos los editores (VS Code, JetBrains, Vim, etc.) respeten automáticamente la misma configuración de indentación, charset y finales de línea.

## Criterios de aceptación
- [x] `.editorconfig` creado con `root = true`.
- [x] Regla `[*]` general: `indent_style = space`, `indent_size = 2`, `end_of_line = lf`, `charset = utf-8`.
- [x] Override `[*.md]`: `trim_trailing_whitespace = false` (espacios al final son saltos de línea en Markdown).
- [x] Override `[*.rs]`: `indent_size = 4` (convención Rust/Tauri).
- [x] Override `[Makefile]`: `indent_style = tab` (Makefiles requieren tabs).

## Archivos creados/modificados
- `.editorconfig` (actualizado desde el stub existente de T-0300)

## Decisiones técnicas
- **`end_of_line = lf`**: Consistente con Prettier y Git. Evita problemas de diff en Windows.
- **`indent_size = 2`**: Estándar del proyecto para JS/TS/JSON/YAML.
- **`indent_size = 4` para Rust**: Convención oficial de Rust — no cambiar.
- **Separación por overrides**: Mejor que múltiples secciones con globs complejos.

## Pendientes no resueltos
- Ninguno. EditorConfig es un archivo único raíz — los proyectos anidados lo heredan.
