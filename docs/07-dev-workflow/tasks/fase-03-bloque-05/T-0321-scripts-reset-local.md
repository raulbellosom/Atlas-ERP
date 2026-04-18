# T-0321 - Configurar scripts para resets locales

## Metadatos
- ID: `T-0321`
- Fase: `Fase 3`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Proporcionar un script de reset completo del entorno local que elimina volúmenes Docker, re-aplica migraciones y ejecuta seeds en una sola ejecución segura.

## Criterios de aceptación
- [x] `tools/reset-local.sh` creado con confirmación explícita antes de ejecutar.
- [x] El script ejecuta: `infra:reset` → `infra:up` → espera readiness de postgres → `db:migrate` → `db:seed`.
- [x] Script `"reset:local": "bash tools/reset-local.sh"` añadido a `package.json` raíz.
- [x] `apps/api` — `"db:reset": "prisma migrate reset --force"` (existía — reset solo de BD sin Docker).
- [x] Diferenciación clara entre `db:reset` (solo BD) y `reset:local` (todo el entorno).

## Archivos creados/modificados
- `tools/reset-local.sh`
- `package.json` (raíz) — script `reset:local`

## Diferencia entre scripts de reset

| Script        | Borra volúmenes Docker | Borra BD | Re-migra | Re-seed |
| ------------- | ---------------------- | -------- | -------- | ------- |
| `db:reset`    | No                     | Sí       | Sí       | No      |
| `reset:local` | Sí                     | Sí       | Sí       | Sí      |

## Decisiones técnicas
- **Confirmación explícita**: El script exige escribir `"si"` — no acepta Enter vacío ni `y`. Previene ejecuciones accidentales.
- **`sleep 5` + `pg_isready`**: PostgreSQL tarda ~2-5 segundos en aceptar conexiones después de arrancar. El sleep evita que la migración falle inmediatamente.
- **Solo para dev**: Este script no aplica en staging/prod. En esos entornos usar `db:migrate:prod`.

## Pendientes no resueltos
- Ninguno.
