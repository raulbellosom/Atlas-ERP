# T-0419 - Crear scripts de reset docker local

## Metadatos
- ID: `T-0419`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Verificar y documentar el script de reset del entorno Docker local, que destruye todos los volumenes y vuelve a un estado limpio con migraciones y seeds aplicados.

## Criterios de aceptacion
- [x] `tools/reset-local.sh` existe y funciona (creado en Fase 3, T-0333).
- [x] Requiere confirmacion explicita del usuario (`si`) antes de ejecutar.
- [x] Destruye volumenes Docker: `docker compose down -v`.
- [x] Levanta servicios frescos y ejecuta migraciones + seeds.
- [x] Mensaje de advertencia claro sobre la naturaleza destructiva de la operacion.
- [x] `pnpm infra:reset` en el root `package.json` como alias del comando docker.

## Archivos verificados
- `tools/reset-local.sh` — creado en Fase 3 (T-0333).

## Flujo del script

```
1. Mostrar advertencia clara: "ELIMINA TODOS LOS DATOS"
2. Pedir confirmacion: escribe 'si' para continuar
3. docker compose down -v     → destruye contenedores + volumenes
4. docker compose up -d       → levanta servicios frescos
5. Esperar pg_isready (sleep 5 + pg_isready -t 30)
6. pnpm db:migrate            → aplica todas las migrations desde cero
7. pnpm db:seed               → carga datos de seed iniciales
8. Mensaje de exito
```

## Cuando usar este script

| Situacion                                   | Script a usar         |
| ------------------------------------------- | --------------------- |
| Levantar infra desde cero (sin borrar datos) | `tools/infra-up.sh`   |
| Borrar datos y empezar desde cero           | `tools/reset-local.sh` |
| Solo bajar infra                            | `pnpm infra:down`     |
| Solo bajar infra + borrar volumenes         | `pnpm infra:reset`    |

## Alias de pnpm

```json
"infra:reset": "docker compose -f infra/docker/docker-compose.dev.yml down -v"
```
Este alias solo hace el `down -v` — NO ejecuta migraciones ni seeds.
Para el reset completo con migraciones usar `tools/reset-local.sh`.

## ADVERTENCIA de uso

Este script es **DESTRUCTIVO e IRREVERSIBLE**:
- Borra `postgres_data`, `redis_data` y `minio_data`.
- Borra todos los archivos subidos a MinIO local.
- Solo usar en desarrollo local — **NUNCA en staging o produccion**.

## Pendientes no resueltos
- Mejorar el polling de pg_isready: el `sleep 5` actual puede ser insuficiente en sistemas lentos. Reemplazar con polling activo (como en T-0418 `infra-up.sh`) en una mejora futura.
