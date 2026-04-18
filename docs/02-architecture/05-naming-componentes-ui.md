# Convención de Naming para Componentes UI

## ID de convención
- Task origen: `T-0022`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Convención oficial
- Nombre de componente: `PascalCase`.
- Nombre de archivo de componente: `PascalCase.jsx` (o `.tsx` si aplica en otro contexto).
- Nombre de hook: `useCamelCase`.
- Nombre de utilidades de UI: `camelCase`.

## Estructura recomendada
- Componentes de página: sufijo `Page` (ejemplo: `BankAccountsPage`).
- Componentes de sección: sufijo semántico (`Panel`, `Section`, `Card`).
- Componentes reutilizables base: carpeta de UI compartida con nombres neutros y explícitos.

## Restricciones
- Evitar nombres genéricos (`Component`, `Widget`, `Thing`).
- Evitar mezclar lógica compleja de sync dentro de componentes visuales.
- Mantener coherencia entre nombre de archivo, export y nombre de componente.

