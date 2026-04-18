#!/usr/bin/env bash
# AtlasERP — Reset completo del entorno local
# Uso: bash tools/reset-local.sh
# ADVERTENCIA: Elimina todos los datos locales de la base de datos.

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'
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

echo -e "${RED}ADVERTENCIA: Este script elimina todos los datos de la BD local.${NC}"
echo -e "Incluye: volumenes Docker, migraciones y datos de seed."
echo ""
read -p "¿Continuar? (escribe 'si' para confirmar): " CONFIRM
CONFIRM="${CONFIRM//$'\r'/}"
CONFIRM="$(printf '%s' "$CONFIRM" | tr '[:upper:]' '[:lower:]')"

if [ "$CONFIRM" != "si" ]; then
  echo "Operacion cancelada."
  exit 0
fi

echo -e "\n${YELLOW}[1/4] Deteniendo Docker y eliminando volumenes...${NC}"
docker compose -f infra/docker/docker-compose.dev.yml down -v

echo -e "${YELLOW}[2/4] Levantando servicios frescos...${NC}"
docker compose -f infra/docker/docker-compose.dev.yml up -d

echo -e "${YELLOW}[3/4] Esperando que PostgreSQL este listo...${NC}"
sleep 5
docker compose -f infra/docker/docker-compose.dev.yml exec postgres \
  pg_isready -U atlaserp -d atlaserp_dev -t 30

echo -e "${YELLOW}[4/4] Ejecutando migraciones y seeds...${NC}"
export DATABASE_URL="${DATABASE_URL:-$DEFAULT_DATABASE_URL}"
run_pnpm db:migrate
run_pnpm db:seed

echo -e "\n${GREEN}Reset local completado.${NC}"
