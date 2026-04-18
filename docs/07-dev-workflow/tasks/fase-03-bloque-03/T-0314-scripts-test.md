# T-0314 — Configurar scripts de test por app

- **Estado**: CERRADA
- **Fecha**: 2025-07-11

## Entregables

| App      | Script test              |
| -------- | ------------------------ |
| api      | `jest --passWithNoTests` |
| web      | `vitest run`             |
| worker   | `jest --passWithNoTests` |

- `apps/desktop` no tiene script de test (se agregará cuando tenga frontend testeable).
- `--passWithNoTests` en Jest para que no falle mientras no haya archivos de test.
