#!/usr/bin/env bash
# Backup de archivos/adjuntos de MinIO para AtlasERP
# Ejecutar via cron: 0 3 * * * /opt/atlaserp/scripts/backup_files.sh

set -euo pipefail

LOG_FILE="${LOG_FILE:-/var/log/atlaserp/backup_files.log}"
TIMESTAMP=$(date -u +"%Y-%m-%d_%H-%M")

# Buckets a respaldar (separados por espacio)
SOURCE_BUCKETS="${SOURCE_BUCKETS:-atlaserp-attachments atlaserp-receipts}"
BACKUP_DESTINATION="${BACKUP_DESTINATION:-s3:atlaserp-backups/files}"

: "${MINIO_ACCESS_KEY:?MINIO_ACCESS_KEY no esta configurado}"
: "${MINIO_SECRET_KEY:?MINIO_SECRET_KEY no esta configurado}"
: "${MINIO_ENDPOINT:?MINIO_ENDPOINT no esta configurado}"

log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*" | tee -a "${LOG_FILE}"
}

error_exit() {
  log "ERROR: $*"
  if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    curl -s -X POST "${SLACK_WEBHOOK_URL}" \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"[AtlasERP Files Backup] ERROR: $* â€” $(hostname) â€” ${TIMESTAMP}\"}" \
      || true
  fi
  exit 1
}

log "Iniciando backup de archivos MinIO: ${TIMESTAMP}"

if ! command -v rclone &> /dev/null; then
  error_exit "rclone no esta disponible â€” instalar con: apt-get install rclone o via https://rclone.org"
fi

# Configurar rclone para MinIO si no esta configurado
export RCLONE_CONFIG_MINIO_TYPE=s3
export RCLONE_CONFIG_MINIO_PROVIDER=Minio
export RCLONE_CONFIG_MINIO_ACCESS_KEY_ID="${MINIO_ACCESS_KEY}"
export RCLONE_CONFIG_MINIO_SECRET_ACCESS_KEY="${MINIO_SECRET_KEY}"
export RCLONE_CONFIG_MINIO_ENDPOINT="${MINIO_ENDPOINT}"

TOTAL_TRANSFERRED=0
ERRORS=0

for BUCKET in ${SOURCE_BUCKETS}; do
  log "Sincronizando bucket: ${BUCKET}"

  DEST="${BACKUP_DESTINATION}/${BUCKET}"

  # Contar archivos antes de sync
  FILES_BEFORE=$(rclone size "minio:${BUCKET}" --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('count',0))" || echo "0")

  rclone sync "minio:${BUCKET}" "${DEST}" \
    --checksum \
    --transfers 4 \
    --log-level INFO \
    --log-file "${LOG_FILE}" \
    --stats-one-line \
    || { log "AVISO: Error al sincronizar bucket ${BUCKET}"; ERRORS=$((ERRORS + 1)); continue; }

  FILES_AFTER=$(rclone size "${DEST}" --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('count',0))" || echo "0")
  log "Bucket ${BUCKET}: ${FILES_BEFORE} archivos en origen, ${FILES_AFTER} en destino"

  TOTAL_TRANSFERRED=$((TOTAL_TRANSFERRED + FILES_AFTER))
done

if [ "${ERRORS}" -gt 0 ]; then
  log "Backup completado con ${ERRORS} errores. Total archivos en destino: ${TOTAL_TRANSFERRED}"
  exit 1
else
  log "Backup de archivos completado exitosamente. Total archivos en destino: ${TOTAL_TRANSFERRED}"
fi

