# T-0428 - Probar persistencia tras reinicio

## Metadatos
- ID: `T-0428`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Comprobar que los volumenes de Postgres, Redis y MinIO conservan datos despues de reiniciar el stack (`down` sin `-v` + `up`).

## Criterios de aceptacion
- [x] Se escribe un marcador en Postgres y se conserva tras reinicio.
- [x] Se escribe un marcador en Redis y se conserva tras reinicio.
- [x] Se escribe un marcador en volumen de MinIO y se conserva tras reinicio.
- [x] Verificacion post-reinicio sin errores.

## Evidencia ejecutada
Marcador de prueba usado: `20260412201427`.

```powershell
# Inicio stack
docker compose -f infra/docker/docker-compose.dev.yml up -d

# Postgres marker
CREATE TABLE IF NOT EXISTS infra_persistence_check (...)
INSERT marker_20260412201427

# Redis marker
SET infra:persistence:marker ok_20260412201427
SAVE

# MinIO marker (archivo en /data)
echo 'minio-marker-20260412201427' > /data/infra-persistence-marker.txt

# Reinicio no destructivo
docker compose -f infra/docker/docker-compose.dev.yml down
docker compose -f infra/docker/docker-compose.dev.yml up -d

# Verificacion
SELECT marker en Postgres
GET marker en Redis
cat marker file en MinIO
```

## Resultado de la prueba
- Postgres despues de reinicio: `marker_20260412201427`.
- Redis despues de reinicio: `ok_20260412201427`.
- MinIO despues de reinicio: `minio-marker-20260412201427`.
- Resultado global: persistencia `OK` en los 3 servicios.

## Observaciones
- Redis persistio correctamente tras `SAVE`.
- La validacion de MinIO se realizo a nivel volumen (`/data`), suficiente para esta fase de infraestructura.
