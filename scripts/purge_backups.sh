#!/usr/bin/env bash
# Purga de backups antiguos de PostgreSQL para AtlasERP
# Ejecutar via cron: 30 2 * * * /opt/atlaserp/scripts/purge_backups.sh
# Implementa la politica de retencion definida en T-2000:
#   - Backups diarios: 30 dias
#   - Ultimo de cada semana: 90 dias
#   - Ultimo de cada mes: 1 anio

set -euo pipefail

BUCKET="${BACKUP_BUCKET:-s3:atlaserp-backups/postgres}"
LOG_FILE="${LOG_FILE:-/var/log/atlaserp/purge_backups.log}"
DAILY_RETENTION="${DAILY_RETENTION_DAYS:-30}"
WEEKLY_RETENTION="${WEEKLY_RETENTION_DAYS:-90}"
MONTHLY_RETENTION="${MONTHLY_RETENTION_DAYS:-365}"

log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*" | tee -a "${LOG_FILE}"
}

log "Iniciando purga de backups. Politica: diarios=${DAILY_RETENTION}d, semanales=${WEEKLY_RETENTION}d, mensuales=${MONTHLY_RETENTION}d"

if ! command -v rclone &> /dev/null; then
  log "AVISO: rclone no disponible â€” omitiendo purga remota"
  exit 0
fi

# Obtener lista de backups en el bucket (formato: atlaserp_prod_YYYY-MM-DD_HH-MM.dump.gpg)
BACKUP_LIST=$(rclone lsf "${BUCKET}/" 2>/dev/null | grep "atlaserp_prod_" | sort || true)

if [ -z "${BACKUP_LIST}" ]; then
  log "No se encontraron backups en ${BUCKET}/"
  exit 0
fi

TODAY=$(date -u +%s)
PURGED=0
KEPT=0

while IFS= read -r FILENAME; do
  [ -z "${FILENAME}" ] && continue

  # Extraer fecha del nombre: atlaserp_prod_YYYY-MM-DD_HH-MM.dump.gpg
  DATE_STR=$(echo "${FILENAME}" | grep -oP '\d{4}-\d{2}-\d{2}' || true)
  [ -z "${DATE_STR}" ] && continue

  FILE_DATE=$(date -d "${DATE_STR}" +%s 2>/dev/null || continue)
  AGE_DAYS=$(( (TODAY - FILE_DATE) / 86400 ))

  DAY_OF_WEEK=$(date -d "${DATE_STR}" +%u)  # 1=Lunes, 7=Domingo
  DAY_OF_MONTH=$(date -d "${DATE_STR}" +%d)

  SHOULD_KEEP=false

  # Siempre conservar si es menor a DAILY_RETENTION dias
  if [ "${AGE_DAYS}" -lt "${DAILY_RETENTION}" ]; then
    SHOULD_KEEP=true
  fi

  # Conservar si es domingo (ultimo de la semana) y menor a WEEKLY_RETENTION dias
  if [ "${DAY_OF_WEEK}" -eq 7 ] && [ "${AGE_DAYS}" -lt "${WEEKLY_RETENTION}" ]; then
    SHOULD_KEEP=true
  fi

  # Conservar si es dia 1 del mes (ultimo del mes) y menor a MONTHLY_RETENTION dias
  if [ "${DAY_OF_MONTH}" -eq "01" ] && [ "${AGE_DAYS}" -lt "${MONTHLY_RETENTION}" ]; then
    SHOULD_KEEP=true
  fi

  if [ "${SHOULD_KEEP}" = "true" ]; then
    log "CONSERVAR: ${FILENAME} (${AGE_DAYS} dias)"
    KEPT=$((KEPT + 1))
  else
    log "PURGAR: ${FILENAME} (${AGE_DAYS} dias)"
    rclone delete "${BUCKET}/${FILENAME}" \
      --log-level INFO \
      --log-file "${LOG_FILE}" \
      && PURGED=$((PURGED + 1)) \
      || log "AVISO: No se pudo eliminar ${FILENAME}"
  fi
done <<< "${BACKUP_LIST}"

log "Purga completada. Conservados: ${KEPT}, Eliminados: ${PURGED}"

