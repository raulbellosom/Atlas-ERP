#!/usr/bin/env bash
# AtlasERP — Script de bootstrap inicial
# Uso: bash tools/bootstrap.sh
# Prepara el entorno de desarrollo desde cero.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()    { echo -e "${GREEN}[OK]${NC}  $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERR]${NC} $1"; exit 1; }
section() { echo -e "\n${YELLOW}=== $1 ===${NC}"; }

section "AtlasERP Bootstrap"

# ── Verificar Node.js >= 20 ───────────────────────────────────────────────────
section "Verificando Node.js"
NODE_MAJOR=$(node -v 2>/dev/null | sed 's/v//' | cut -d'.' -f1 || echo "0")
if [ "$NODE_MAJOR" -lt 20 ]; then
  error "Node.js >= 20 requerido. Version actual: $(node -v 2>/dev/null || echo 'no instalado')"
fi
info "Node.js $(node -v)"

# ── Verificar pnpm >= 9 ───────────────────────────────────────────────────────
section "Verificando pnpm"
if ! command -v pnpm &>/dev/null; then
  error "pnpm no encontrado. Instalar: npm install -g pnpm@9"
fi
PNPM_MAJOR=$(pnpm -v | cut -d'.' -f1)
if [ "$PNPM_MAJOR" -lt 9 ]; then
  error "pnpm >= 9 requerido. Version actual: $(pnpm -v)"
fi
info "pnpm $(pnpm -v)"

# ── Instalar dependencias ─────────────────────────────────────────────────────
section "Instalando dependencias"
pnpm install
info "Dependencias instaladas"

# ── Copiar .env.example → .env ────────────────────────────────────────────────
section "Configurando archivos .env"
if [ -f "apps/api/.env.example" ] && [ ! -f "apps/api/.env" ]; then
  cp apps/api/.env.example apps/api/.env
  info "Creado: apps/api/.env"
  warn "Edita apps/api/.env con tus valores locales antes de continuar"
else
  info "apps/api/.env ya existe — no se sobreescribe"
fi

# ── Verificar Docker ──────────────────────────────────────────────────────────
section "Verificando Docker"
if command -v docker &>/dev/null; then
  info "Docker $(docker --version | awk '{print $3}' | tr -d ',')"
  warn "Ejecuta 'pnpm infra:up' para levantar PostgreSQL, Redis y MinIO"
else
  warn "Docker no encontrado — instalar para levantar servicios locales"
fi

# ── Resumen ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Bootstrap completado exitosamente  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
echo ""
echo "Pasos siguientes:"
echo "  1. Editar apps/api/.env con tus valores"
echo "  2. pnpm infra:up      — Levantar Docker (postgres, redis, minio)"
echo "  3. pnpm db:migrate    — Ejecutar migraciones"
echo "  4. pnpm dev           — Iniciar todas las apps"
echo ""
