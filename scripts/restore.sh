#!/usr/bin/env bash
# Script de restore de PostgreSQL para AtlasERP
# USO: ./restore.sh <backup-file.dump.gpg> [--no-confirm]
# ADVERTENCIA: Este script BORRA la base de datos existente antes de restaurar.

set -euo pipefail

BACKUP_FILE="${1:-}"
NO_CONFIRM="${2:-}"
LOG_FILE="${LOG_FILE:-/var/log/atlaserp/restore.log}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

: "${DATABASE_URL:?DATABASE_URL no esta configurado}"
: "${BACKUP_PASSPHRASE:?BACKUP_PASSPHRASE no esta configurado}"

log() {
  echo "[${TIMESTAMP}] $*" | tee -a "${LOG_FILE}"
}

error_exit() {
  log "ERROR: $*"
  exit 1
}

# â”€â”€ Validaciones iniciales â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
if [ -z "${BACKUP_FILE}" ]; then
  echo "USO: $0 <backup-file.dump.gpg> [--no-confirm]"
  echo ""
  echo "Ejemplos:"
  echo "  $0 atlaserp_prod_2026-04-18_02-00.dump.gpg"
  echo "  $0 atlaserp_prod_2026-04-18_02-00.dump.gpg --no-confirm"
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  error_exit "Archivo de backup no encontrado: ${BACKUP_FILE}"
fi

# â”€â”€ Confirmacion â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
if [ "${NO_CONFIRM}" != "--no-confirm" ]; then
  echo ""
  echo "â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”"
  echo "â”‚                    ADVERTENCIA DE RESTORE                       â”‚"
  echo "â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤"
  echo "â”‚  Este script ELIMINARA TODOS LOS DATOS de la base de datos      â”‚"
  echo "â”‚  configurada en DATABASE_URL y los reemplazara con el backup.   â”‚"
  echo "â”‚                                                                  â”‚"
  echo "â”‚  Archivo: ${BACKUP_FILE}"
  echo "â”‚  Base de datos: $(echo ${DATABASE_URL} | sed 's|.*@||')"
  echo "â”‚                                                                  â”‚"
  echo "â”‚  Esta accion es IRREVERSIBLE sin un backup propio previo.       â”‚"
  echo "â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜"
  echo ""
  read -r -p "Escribe 'RESTAURAR' para confirmar: " CONFIRM
  if [ "${CONFIRM}" != "RESTAURAR" ]; then
    echo "Operacion cancelada."
    exit 0
  fi
fi

log "Iniciando restore desde: ${BACKUP_FILE}"

# â”€â”€ Extraer credenciales de DATABASE_URL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DB_HOST=$(echo "${DATABASE_URL}" | sed 's|.*@\(.*\):\([0-9]*\)/.*|\1|')
DB_PORT=$(echo "${DATABASE_URL}" | sed 's|.*:\([0-9]*\)/.*|\1|')
DB_NAME=$(echo "${DATABASE_URL}" | sed 's|.*/||')
DB_USER=$(echo "${DATABASE_URL}" | sed 's|postgres://\(.*\):.*@.*|\1|')
DB_PASS=$(echo "${DATABASE_URL}" | sed 's|postgres://.*:\(.*\)@.*|\1|')
export PGPASSWORD="${DB_PASS}"

# â”€â”€ Descifrar backup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DECRYPTED_FILE="${BACKUP_FILE%.gpg}"
log "Descifrando backup..."
gpg \
  --batch \
  --decrypt \
  --passphrase "${BACKUP_PASSPHRASE}" \
  --output "${DECRYPTED_FILE}" \
  "${BACKUP_FILE}" \
  || error_exit "Error al descifrar el backup"
log "Backup descifrado: ${DECRYPTED_FILE}"

# â”€â”€ Verificar integridad antes de restaurar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
log "Verificando integridad del backup..."
pg_restore --list "${DECRYPTED_FILE}" > /dev/null \
  || error_exit "El backup esta corrupto â€” abortando restore"
log "Integridad verificada OK"

# â”€â”€ Terminar conexiones activas a la BD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
log "Terminando conexiones activas a la base de datos..."
psql \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname=postgres \
  --no-password \
  --command="SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" \
  || log "AVISO: No se pudieron terminar todas las conexiones activas"

# â”€â”€ Borrar y recrear la base de datos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
log "Borrando base de datos existente: ${DB_NAME}"
psql \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname=postgres \
  --no-password \
  --command="DROP DATABASE IF EXISTS \"${DB_NAME}\";" \
  || error_exit "No se pudo borrar la base de datos"

psql \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname=postgres \
  --no-password \
  --command="CREATE DATABASE \"${DB_NAME}\" WITH OWNER = \"${DB_USER}\" ENCODING = 'UTF8';" \
  || error_exit "No se pudo crear la base de datos"

log "Base de datos recreada"

# â”€â”€ Restaurar desde el backup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
log "Restaurando datos desde backup..."
pg_restore \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname="${DB_NAME}" \
  --no-password \
  --verbose \
  --single-transaction \
  "${DECRYPTED_FILE}" \
  2>&1 | tee -a "${LOG_FILE}" \
  || error_exit "pg_restore fallo â€” la base de datos puede estar en estado inconsistente"

unset PGPASSWORD

# â”€â”€ Limpiar archivo temporal descifrado â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
rm -f "${DECRYPTED_FILE}"
log "Archivo temporal eliminado"

log "RESTORE COMPLETADO EXITOSAMENTE desde: ${BACKUP_FILE}"
log "Verificar la integridad de los datos y ejecutar los smoke tests del sistema."

