# Idioma Principal y Estándares de i18n

## ID de política
- Task origen: `T-0025`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Idioma oficial del proyecto
- Idioma principal de documentación y comunicación interna: **español de México** (`es-MX`).
- Codificación obligatoria de texto: **UTF-8**.

## Estándares mínimos de i18n
- Locale base de producto: `es-MX`.
- Las etiquetas visibles al usuario deben permitir internacionalización progresiva.
- No hardcodear textos de UI sensibles cuando exista capa de traducciones.
- Las claves de traducción deben ser estables, semánticas y consistentes por módulo.

## Convención recomendada de claves
- Formato: `modulo.seccion.elemento.estado`.
- Ejemplo: `financialOperations.movements.table.empty`.

## Restricciones
- No mezclar idiomas en el mismo literal de interfaz de usuario.
- No introducir texto en codificación distinta de UTF-8.

