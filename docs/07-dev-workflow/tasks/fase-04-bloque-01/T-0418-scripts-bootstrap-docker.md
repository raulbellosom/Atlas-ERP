# T-0418 - Crear scripts de bootstrap docker local

## Metadatos
- ID: `T-0418`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Crear un script de bootstrap de infraestructura Docker que levante los servicios, espere a que esten healthy y configure el bucket inicial de MinIO, facilitando el setup desde cero para nuevos desarrolladores.

## Criterios de aceptacion
- [x] `tools/infra-up.sh` creado con verificacion de Docker, arranque de servicios y espera de healthchecks.
- [x] Espera activa (polling) para PostgreSQL, Redis y MinIO antes de continuar.
- [x] Creacion automatica del bucket de MinIO via `mc` (MinIO Client) si esta instalado.
- [x] Instrucciones alternativas si `mc` no esta disponible (consola web).
- [x] Salida con colores e instrucciones claras de proximos pasos.
- [x] `tools/bootstrap.sh` existente complementa este script (verifica Node/pnpm, instala deps).

## Archivos creados
- `tools/infra-up.sh`

## Flujo del script

```
1. Verificar Docker instalado y corriendo
2. docker compose -f infra/docker/docker-compose.dev.yml up -d
3. Polling hasta pg_isready → PostgreSQL listo
4. Polling hasta redis-cli ping → Redis listo
5. Polling hasta curl /minio/health/live → MinIO listo
6. Si mc disponible: crear bucket "atlasrep-files" si no existe
7. Imprimir resumen con endpoints y proximos pasos
```

## Uso

```bash
# Setup inicial completo (desde cero):
bash tools/bootstrap.sh    # verifica Node/pnpm, instala deps
bash tools/infra-up.sh     # levanta Docker y espera healthchecks
pnpm db:migrate            # ejecuta migraciones de Prisma
pnpm dev                   # arranca todas las apps

# Solo levantar infra (si ya esta instalado):
bash tools/infra-up.sh
# o via pnpm:
pnpm infra:up              # equivalente sin esperar healthchecks
```

## Variables de entorno del script

| Variable       | Default          | Descripcion                     |
| -------------- | ---------------- | ------------------------------- |
| `MINIO_BUCKET` | `atlasrep-files` | Nombre del bucket inicial       |
| `MAX_WAIT`     | `60`             | Segundos max de espera por servicio |

## Dependencia: MinIO Client (mc)

`mc` es el cliente CLI oficial de MinIO para crear buckets via script.
- Instalacion: `brew install minio-mc` (Mac) / `snap install minio-mc` (Linux)
- Si no esta instalado, el script muestra instrucciones para crear el bucket manualmente en `http://localhost:9001`.

## Relacion con scripts existentes

| Script                   | Proposito                                              |
| ------------------------ | ------------------------------------------------------ |
| `tools/bootstrap.sh`     | Setup inicial: Node, pnpm, deps, .env                  |
| `tools/infra-up.sh`      | Levanta Docker y espera que este listo (este script)   |
| `tools/reset-local.sh`   | Reset destructivo: borra volumenes y vuelve a empezar |
| `pnpm infra:up`          | Shortcut de docker compose up (sin esperar healthchecks) |

## Pendientes no resueltos
- Creacion automatica de bucket sin `mc` (usando API S3 directamente con curl) — mejora opcional.
- Script de verificacion de estado de infra (`tools/infra-status.sh`) — Fase 4 T-0425+.
