#!/usr/bin/env bash
# infra/scripts/postgres-init.sh
# Script de inicializacion de PostgreSQL para AtlasERP.
# Se ejecuta automaticamente en el primer arranque del contenedor via docker-entrypoint-initdb.d/.
#
# IMPORTANTE: Solo se ejecuta si el volumen de datos esta vacio (primer arranque).
# En arranques subsiguientes este script NO se ejecuta.
#
# Variables disponibles (inyectadas por la imagen oficial postgres):
#   POSTGRES_USER       — usuario superadmin creado por la imagen
#   POSTGRES_DB         — base de datos principal creada por la imagen
#   POSTGRES_PASSWORD   — password del usuario superadmin

set -euo pipefail

echo "[AtlasERP] Iniciando configuracion de PostgreSQL..."

# Crear extension pgcrypto (necesaria para UUIDs y hashing)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL

echo "[AtlasERP] Extensiones instaladas: pgcrypto, uuid-ossp"

# Configuracion de timezone para la base de datos
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    ALTER DATABASE "$POSTGRES_DB" SET timezone TO 'UTC';
EOSQL

echo "[AtlasERP] Timezone configurado en UTC"

echo "[AtlasERP] Inicializacion de PostgreSQL completada."
