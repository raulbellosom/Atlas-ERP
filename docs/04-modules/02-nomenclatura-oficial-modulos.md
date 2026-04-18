# Nomenclatura Oficial de Módulos

## ID de convención
- Task origen: `T-0018`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Regla de nomenclatura
- Nombre canónico de módulo: `PascalCase` en inglés de dominio.
- Nombre visible de módulo: etiqueta de producto orientada a usuario (puede ser en español).
- Nombre técnico de carpeta: `kebab-case`.
- Nombre técnico interno de paquete/módulo: `snake_case` solo cuando el tooling lo requiera; en general preferir `kebab-case`/`PascalCase` según contexto.

## Módulos definidos actualmente
- `Core Platform` (`core-platform`)
- `Sync Core` (`sync-core`)
- `Financial Operations Core` (`financial-operations-core`) visible como `Tesorería y Movimientos`
- Futuros:
  - `Accounting Core` (`accounting-core`)
  - `HR Core` (`hr-core`)
  - `Purchases` (`purchases`)
  - `Inventory` (`inventory`)
  - `CRM` (`crm`)

## Restricciones
- No mezclar idiomas en el nombre canónico del módulo.
- No usar abreviaturas ambiguas para módulos.

