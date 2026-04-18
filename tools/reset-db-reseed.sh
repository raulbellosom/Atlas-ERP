#!/usr/bin/env bash
# AtlasERP - Reset de base de datos con reseed (sin borrar volumenes Docker)
# Uso: bash tools/reset-db-reseed.sh
# ADVERTENCIA: Elimina todas las tablas de PostgreSQL local y reconstruye con migraciones + seeds.

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

COMPOSE_FILE="infra/docker/docker-compose.dev.yml"
DEFAULT_DATABASE_URL="postgresql://atlaserp:atlaserp_dev@localhost:5432/atlaserp_dev"

run_pnpm() {
  if command -v cmd.exe >/dev/null 2>&1; then
    if [ -n "${DATABASE_URL:-}" ]; then
      cmd.exe /c "set DATABASE_URL=${DATABASE_URL}&& pnpm $*"
    else
      cmd.exe /c "pnpm $*"
    fi
  else
    pnpm "$@"
  fi
}

echo -e "${RED}ADVERTENCIA: Este script resetea la BD local de AtlasERP.${NC}"
echo -e "No elimina volumenes de Docker, pero borra tablas y datos de PostgreSQL."
echo ""
read -p "Continuar? (escribe 'si' para confirmar): " CONFIRM
CONFIRM="${CONFIRM//$'\r'/}"
CONFIRM="$(printf '%s' "$CONFIRM" | tr '[:upper:]' '[:lower:]')"

if [ "$CONFIRM" != "si" ]; then
  echo "Operacion cancelada."
  exit 0
fi

echo -e "\n${YELLOW}[1/5] Asegurando infraestructura local...${NC}"
docker compose -f "$COMPOSE_FILE" up -d

echo -e "${YELLOW}[2/5] Esperando PostgreSQL...${NC}"
sleep 5
docker compose -f "$COMPOSE_FILE" exec -T postgres \
  pg_isready -U atlaserp -d atlaserp_dev -t 30

echo -e "${YELLOW}[3/5] Reseteando schema y reaplicando migraciones...${NC}"
export DATABASE_URL="${DATABASE_URL:-$DEFAULT_DATABASE_URL}"
run_pnpm --filter @atlasrep/api exec prisma migrate reset \
  --force \
  --skip-seed \
  --schema ../../prisma/schema.prisma

echo -e "${YELLOW}[4/5] Ejecutando seeds foundation...${NC}"
run_pnpm db:seed

echo -e "${YELLOW}[5/5] Verificando estado de migraciones...${NC}"
run_pnpm db:migrate:status

echo -e "\n${GREEN}Reset con reseed completado.${NC}"
