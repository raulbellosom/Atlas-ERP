#!/usr/bin/env bash
# Backup automatico de PostgreSQL para AtlasERP
# Ejecutar via cron: 0 2 * * * /opt/atlaserp/scripts/backup_pg.sh

set -euo pipefail

# â”€â”€ Configuracion â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
BACKUP_DIR="${BACKUP_DIR:-/var/backups/atlaserp}"
BUCKET="${BACKUP_BUCKET:-s3:atlaserp-backups/postgres}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
LOG_FILE="${LOG_FILE:-/var/log/atlaserp/backup_pg.log}"
TIMESTAMP=$(date -u +"%Y-%m-%d_%H-%M")
BACKUP_FILE="atlaserp_prod_${TIMESTAMP}.dump"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Verificar variables requeridas
: "${DATABASE_URL:?DATABASE_URL no esta configurado}"
: "${BACKUP_PASSPHRASE:?BACKUP_PASSPHRASE no esta configurado}"

# â”€â”€ Logging â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*" | tee -a "${LOG_FILE}"
}

error_exit() {
  log "ERROR: $*"
  # Notificacion de fallo (ajustar segun herramienta de alertas del equipo)
  if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    curl -s -X POST "${SLACK_WEBHOOK_URL}" \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"[AtlasERP Backup] ERROR: $* â€” $(hostname) â€” ${TIMESTAMP}\"}" \
      || true
  fi
  exit 1
}

# â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
log "Iniciando backup de PostgreSQL: ${BACKUP_FILE}"

# Crear directorio de backup si no existe
mkdir -p "${BACKUP_DIR}"

# Verificar espacio disponible (minimo 2 GB)
AVAILABLE_KB=$(df -k "${BACKUP_DIR}" | tail -1 | awk '{print $4}')
if [ "${AVAILABLE_KB}" -lt 2097152 ]; then
  error_exit "Espacio insuficiente en disco: ${AVAILABLE_KB} KB disponibles (minimo 2 GB requeridos)"
fi

# Extraer host, port, user y dbname desde DATABASE_URL
# Formato: postgres://user:password@host:port/dbname
DB_HOST=$(echo "${DATABASE_URL}" | sed 's|.*@\(.*\):\(.*\)/.*|\1|')
DB_PORT=$(echo "${DATABASE_URL}" | sed 's|.*:\([0-9]*\)/.*|\1|')
DB_NAME=$(echo "${DATABASE_URL}" | sed 's|.*/||')
DB_USER=$(echo "${DATABASE_URL}" | sed 's|postgres://\(.*\):.*@.*|\1|')
DB_PASS=$(echo "${DATABASE_URL}" | sed 's|postgres://.*:\(.*\)@.*|\1|')

export PGPASSWORD="${DB_PASS}"

# Ejecutar pg_dump
log "Ejecutando pg_dump..."
pg_dump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname="${DB_NAME}" \
  --format=custom \
  --compress=9 \
  --no-password \
  --file="${BACKUP_PATH}" \
  || error_exit "pg_dump fallo (exit code $?)"

unset PGPASSWORD

# Verificar que el archivo se genero y no esta vacio
if [ ! -s "${BACKUP_PATH}" ]; then
  error_exit "El archivo de backup esta vacio o no existe: ${BACKUP_PATH}"
fi

BACKUP_SIZE=$(du -sh "${BACKUP_PATH}" | cut -f1)
log "pg_dump completado. Tamanio: ${BACKUP_SIZE}"

# Verificar integridad del backup
log "Verificando integridad del backup..."
pg_restore --list "${BACKUP_PATH}" > /dev/null \
  || error_exit "Verificacion de integridad fallo â€” el backup puede estar corrupto"
log "Integridad verificada OK"

# Cifrar el backup
log "Cifrando backup..."
ENCRYPTED_PATH="${BACKUP_PATH}.gpg"
gpg \
  --batch \
  --symmetric \
  --cipher-algo AES256 \
  --passphrase "${BACKUP_PASSPHRASE}" \
  --output "${ENCRYPTED_PATH}" \
  "${BACKUP_PATH}" \
  || error_exit "Cifrado GPG fallo"

# Borrar el archivo sin cifrar
rm -f "${BACKUP_PATH}"
log "Backup cifrado: ${ENCRYPTED_PATH}"

# Subir al almacenamiento remoto (si rclone esta configurado)
if command -v rclone &> /dev/null; then
  log "Subiendo backup al almacenamiento remoto: ${BUCKET}"
  rclone copy "${ENCRYPTED_PATH}" "${BUCKET}/" \
    --log-level INFO \
    --log-file "${LOG_FILE}" \
    || error_exit "Error al subir backup al almacenamiento remoto"
  log "Upload completado"
else
  log "AVISO: rclone no disponible â€” backup guardado localmente en ${BACKUP_DIR}"
fi

# Purgar backups locales antiguos (mas de RETENTION_DAYS dias)
log "Purgando backups locales mayores a ${RETENTION_DAYS} dias..."
find "${BACKUP_DIR}" -name "atlaserp_prod_*.dump.gpg" -mtime "+${RETENTION_DAYS}" -delete
log "Purga local completada"

log "Backup completado exitosamente: ${BACKUP_FILE}.gpg (${BACKUP_SIZE})"

