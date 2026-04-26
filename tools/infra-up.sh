#!/usr/bin/env bash
# AtlasERP â€” Script de bootstrap de infraestructura Docker local
# Uso: bash tools/infra-up.sh
#
# Levanta PostgreSQL, Redis y MinIO en Docker, espera a que esten
# healthy y crea el bucket inicial de MinIO si no existe.
# Equivalente a: pnpm infra:up + espera + setup de MinIO

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${GREEN}[OK]${NC}  $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERR]${NC} $1"; exit 1; }
section() { echo -e "\n${BLUE}=== $1 ===${NC}"; }

COMPOSE_FILE="infra/docker/docker-compose.dev.yml"
MINIO_BUCKET="${MINIO_BUCKET:-atlaserp-files}"
MAX_WAIT=60   # segundos maximos de espera por servicio

# â”€â”€ Verificar Docker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
section "Verificando Docker"
if ! command -v docker &>/dev/null; then
  error "Docker no encontrado. Instalar Docker Desktop: https://www.docker.com/products/docker-desktop"
fi
if ! docker info &>/dev/null; then
  error "Docker no esta corriendo. Iniciar Docker Desktop e intentar de nuevo."
fi
info "Docker corriendo"

# â”€â”€ Levantar servicios â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
section "Levantando servicios Docker"
docker compose -f "$COMPOSE_FILE" up -d
info "Servicios iniciados"

# â”€â”€ Esperar a PostgreSQL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
section "Esperando PostgreSQL"
elapsed=0
until docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U atlaserp -d atlaserp_dev &>/dev/null; do
  if [ $elapsed -ge $MAX_WAIT ]; then
    error "PostgreSQL no respondio en ${MAX_WAIT}s. Revisar: docker compose -f $COMPOSE_FILE logs postgres"
  fi
  echo -n "."
  sleep 2
  elapsed=$((elapsed + 2))
done
echo ""
info "PostgreSQL listo (${elapsed}s)"

# â”€â”€ Esperar a Redis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
section "Esperando Redis"
elapsed=0
until docker compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; do
  if [ $elapsed -ge $MAX_WAIT ]; then
    error "Redis no respondio en ${MAX_WAIT}s. Revisar: docker compose -f $COMPOSE_FILE logs redis"
  fi
  echo -n "."
  sleep 2
  elapsed=$((elapsed + 2))
done
echo ""
info "Redis listo (${elapsed}s)"

# â”€â”€ Esperar a MinIO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
section "Esperando MinIO"
elapsed=0
until curl -sf http://localhost:9000/minio/health/live &>/dev/null; do
  if [ $elapsed -ge $MAX_WAIT ]; then
    error "MinIO no respondio en ${MAX_WAIT}s. Revisar: docker compose -f $COMPOSE_FILE logs minio"
  fi
  echo -n "."
  sleep 2
  elapsed=$((elapsed + 2))
done
echo ""
info "MinIO listo (${elapsed}s)"

# â”€â”€ Crear bucket de MinIO si no existe â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
section "Configurando bucket de MinIO"
if command -v mc &>/dev/null; then
  mc alias set atlaserp-local http://localhost:9000 atlaserp atlaserp_dev --quiet 2>/dev/null || true
  if mc ls atlaserp-local/"$MINIO_BUCKET" &>/dev/null; then
    info "Bucket '$MINIO_BUCKET' ya existe"
  else
    mc mb atlaserp-local/"$MINIO_BUCKET" --quiet
    info "Bucket '$MINIO_BUCKET' creado"
  fi
else
  warn "mc (MinIO Client) no instalado â€” crear bucket manualmente en http://localhost:9001"
  warn "Credenciales: user=atlaserp, password=atlaserp_dev"
  warn "Bucket a crear: $MINIO_BUCKET"
fi

# â”€â”€ Resumen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo -e "${GREEN}â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—${NC}"
echo -e "${GREEN}â•‘   Infraestructura Docker lista           â•‘${NC}"
echo -e "${GREEN}â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•${NC}"
echo ""
echo "Servicios disponibles:"
echo "  PostgreSQL  â†’ localhost:5432  (user: atlaserp, db: atlaserp_dev)"
echo "  Redis       â†’ localhost:6379"
echo "  MinIO API   â†’ localhost:9000  (bucket: $MINIO_BUCKET)"
echo "  MinIO UI    â†’ http://localhost:9001"
echo ""
echo "Pasos siguientes:"
echo "  pnpm db:migrate   â€” Ejecutar migraciones de Prisma"
echo "  pnpm dev          â€” Iniciar todas las apps"
echo ""

