# T-0328 - Configurar estándares de variables de entorno

## Metadatos
- ID: `T-0328`
- Fase: `Fase 3`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Establecer la referencia completa de todas las variables de entorno por app y crear `docs/02-architecture/18-referencia-env-vars.md` como catalogo maestro actualizable.

## Criterios de aceptación
- [x] Estrategia base existente en `docs/02-architecture/10-estrategia-environment-variables.md` (T-0040).
- [x] `docs/02-architecture/18-referencia-env-vars.md` creado — catalogo por app.
- [x] Tabla completa para `apps/api`: DATABASE_URL, REDIS_*, S3_*, JWT_*, PORT, NODE_ENV.
- [x] Tabla completa para `apps/web`: VITE_API_URL, VITE_APP_NAME, VITE_ENV.
- [x] Tabla completa para `apps/worker`: DATABASE_URL, REDIS_*, S3_*, NODE_ENV.
- [x] Tabla completa para `apps/desktop`: VITE_API_URL, DESKTOP_DATA_DIR.
- [x] Reglas de prefijos por app documentadas y consistentes con T-0040.
- [x] Proceso de actualizacion documentado (toda variable nueva → .env.example + tabla).

## Archivos creados/modificados
- `docs/02-architecture/18-referencia-env-vars.md`

## Prefijos por app (resumen)

| App       | Prefijo variables propias | Variables compartidas              |
| --------- | ------------------------- | ---------------------------------- |
| api       | `API_` (ninguna aun)      | DATABASE_URL, REDIS_*, S3_*, JWT_* |
| web       | `VITE_`                   | (ninguna — todo via API)           |
| worker    | `WORKER_` (ninguna aun)   | DATABASE_URL, REDIS_*, S3_*        |
| desktop   | `DESKTOP_`, `VITE_`       | (config local en SQLite)           |

## Validacion de cumplimiento
- [ ] Todas las variables en las tablas tienen `.env.example` correspondiente.
- [ ] `apps/api/.env.example` — creado en T-0319 ✓
- [ ] `apps/web/.env.example` — por crear en T-0330
- [ ] `apps/worker/.env.example` — por crear en T-0330
- [ ] `apps/desktop/.env.example` — por crear en T-0330

## Pendientes no resueltos
- Los `.env.example` de web, worker y desktop se crean en T-0330.
- La validacion de arranque (fail fast) se implementa en T-0331 a T-0334.
