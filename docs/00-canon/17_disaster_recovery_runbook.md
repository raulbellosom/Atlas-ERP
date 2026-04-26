# Runbook de Disaster Recovery â€” AtlasERP

**VersiÃ³n:** 1.0
**Fecha:** 2026-04-18
**Task origen:** T-2008 (Fase 20 Bloque 2)

---

## Antes de empezar

Este runbook asume un escenario de desastre total: el servidor de producciÃ³n no responde, los datos estÃ¡n perdidos o corruptos. El objetivo es restaurar el sistema en menos de 4 horas (RTO objetivo).

**Accesos requeridos:**
- Credenciales del gestor de secretos (AWS Secrets Manager / Vault).
- Acceso al bucket de backups (S3 / almacenamiento remoto).
- Clave SSH al nuevo servidor (o capacidad de provisionar uno nuevo).
- Imagen Docker del cÃ³digo en GHCR (`ghcr.io/{org}/atlaserp-api:{version}`).

---

## Paso 1: Evaluar el alcance del desastre (5 min)

1. Â¿El servidor de producciÃ³n responde? (`curl https://api.atlaserp.com/health`)
2. Â¿La base de datos estÃ¡ accesible? (intentar conexiÃ³n directa con las credenciales del gestor de secretos)
3. Â¿Los backups en S3 estÃ¡n accesibles? (`rclone lsf s3:atlaserp-backups/postgres/ | head -5`)
4. Documentar el estado y hora del incidente.

---

## Paso 2: Provisionar nuevo servidor (15â€“30 min)

Si el servidor original no puede recuperarse:

```bash
# En el proveedor de nube (ejemplo: DigitalOcean, Hetzner, AWS EC2)
# Provisionar servidor con:
# - Ubuntu 22.04 LTS
# - mÃ­nimo 4 vCPU, 8 GB RAM
# - 100 GB disco SSD
# - Docker instalado
# - Acceso SSH con la clave de deploy de producciÃ³n
```

Instalar dependencias en el nuevo servidor:
```bash
apt-get update && apt-get install -y docker.io docker-compose postgresql-client gpg rclone
```

---

## Paso 3: Recuperar secretos y configuraciÃ³n (10 min)

```bash
# Desde el gestor de secretos
aws secretsmanager get-secret-value \
  --secret-id atlaserp-prod \
  --query SecretString \
  --output text > /tmp/secrets.json

# Extraer variables al archivo .env
# (ajustar segÃºn el formato del gestor)
cat /tmp/secrets.json | jq -r 'to_entries[] | "\(.key)=\(.value)"' > /opt/atlaserp/.env.prod
chmod 600 /opt/atlaserp/.env.prod
rm /tmp/secrets.json
```

---

## Paso 4: Identificar el backup a restaurar (5 min)

```bash
# Listar backups disponibles (mÃ¡s recientes primero)
rclone lsf s3:atlaserp-backups/postgres/ | sort -r | head -10
```

Elegir el backup mÃ¡s reciente antes del incidente:
```
atlaserp_prod_2026-04-18_02-00.dump.gpg  â† elegir este
atlaserp_prod_2026-04-17_02-00.dump.gpg
...
```

Descargar el backup:
```bash
mkdir -p /opt/atlaserp/backups
rclone copy s3:atlaserp-backups/postgres/atlaserp_prod_2026-04-18_02-00.dump.gpg \
  /opt/atlaserp/backups/
```

---

## Paso 5: Restaurar la base de datos (20â€“40 min)

```bash
# Levantar PostgreSQL con Docker
docker run -d --name postgres-restore \
  -e POSTGRES_USER=atlaserp \
  -e POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
  -e POSTGRES_DB=atlaserp_prod \
  -p 5432:5432 \
  postgres:16

# Esperar a que PostgreSQL estÃ© listo
sleep 10
docker exec postgres-restore pg_isready -U atlaserp

# Restaurar desde el backup
source /opt/atlaserp/.env.prod
BACKUP_PASSPHRASE="${BACKUP_PASSPHRASE}" \
DATABASE_URL="${DATABASE_URL}" \
  /opt/atlaserp/scripts/restore.sh \
  /opt/atlaserp/backups/atlaserp_prod_2026-04-18_02-00.dump.gpg \
  --no-confirm

# Verificar que los datos estÃ¡n presentes
docker exec postgres-restore psql -U atlaserp -d atlaserp_prod \
  -c "SELECT COUNT(*) FROM \"FinancialMovement\";"
```

---

## Paso 6: Aplicar migraciones pendientes (5 min)

Si el backup es de una versiÃ³n anterior al cÃ³digo actual, puede haber migraciones pendientes:

```bash
docker run --rm \
  --env-file /opt/atlaserp/.env.prod \
  ghcr.io/{org}/atlaserp-api:{latest-version} \
  node -e "require('./dist/main').runMigrations()"

# O usando la CLI de Prisma directamente
docker run --rm \
  --env-file /opt/atlaserp/.env.prod \
  ghcr.io/{org}/atlaserp-api:{latest-version} \
  npx prisma migrate deploy
```

---

## Paso 7: Levantar los servicios (10 min)

```bash
# Crear docker-compose.yml en /opt/atlaserp/
cat > /opt/atlaserp/docker-compose.yml << 'EOF'
version: '3.8'
services:
  api:
    image: ghcr.io/{org}/atlaserp-api:{version}
    env_file: .env.prod
    ports:
      - "3000:3000"
    restart: unless-stopped

  worker:
    image: ghcr.io/{org}/atlaserp-worker:{version}
    env_file: .env.prod
    restart: unless-stopped

  web:
    image: ghcr.io/{org}/atlaserp-web:{version}
    ports:
      - "80:80"
    restart: unless-stopped
EOF

cd /opt/atlaserp
docker-compose up -d
```

---

## Paso 8: Restaurar archivos (MinIO) (15â€“30 min)

```bash
# Sincronizar archivos desde el backup remoto
rclone sync s3:atlaserp-backups/files/atlaserp-attachments minio:atlaserp-attachments \
  --checksum \
  --log-level INFO

rclone sync s3:atlaserp-backups/files/atlaserp-receipts minio:atlaserp-receipts \
  --checksum \
  --log-level INFO
```

---

## Paso 9: Verificar sistema restaurado (10 min)

```bash
# Health check
curl https://api.atlaserp.com/health

# Verificar mÃ©tricas
curl https://api.atlaserp.com/metrics/jobs
curl https://api.atlaserp.com/metrics/sync

# Verificar login
curl -X POST https://api.atlaserp.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@atlaserp.com","password":"..."}'
```

---

## Paso 10: Comunicar y documentar (inmediato)

1. Notificar al equipo que el sistema estÃ¡ restaurado.
2. Notificar a los usuarios afectados con el periodo de pÃ©rdida de datos (si lo hay).
3. Documentar el incidente: hora de inicio, causa probable, pasos ejecutados, hora de restauraciÃ³n.
4. Crear un ticket de post-mortem para analizar la causa raÃ­z y prevenir futuros incidentes.

---

## RTO objetivo vs. empÃ­rico

| Paso | Tiempo estimado |
|------|----------------|
| EvaluaciÃ³n del desastre | 5 min |
| Provisionar servidor | 15â€“30 min |
| Recuperar secretos | 10 min |
| Identificar y descargar backup | 5 min |
| Restaurar BD | 20â€“40 min |
| Aplicar migraciones | 5 min |
| Levantar servicios | 10 min |
| Restaurar archivos | 15â€“30 min |
| VerificaciÃ³n | 10 min |
| **Total estimado** | **95â€“145 min (< 3h)** |

**RTO objetivo: 4 horas.** El proceso completo deberÃ­a completarse bien dentro del margen.

---

## ApÃ©ndice A â€” Restore parcial de mÃ³dulo (Financial Operations Core)

En escenarios donde solo se necesita recuperar datos transaccionales sin sobreescribir configuraciÃ³n global, usuarios o catÃ¡logos de otros mÃ³dulos:

```bash
# 1. Descifrar el backup completo
BACKUP_PASSPHRASE="${BACKUP_PASSPHRASE}" \
gpg --batch --decrypt --passphrase "${BACKUP_PASSPHRASE}" \
  --output atlaserp_prod.dump atlaserp_prod_2026-04-18_02-00.dump.gpg

# 2. Restaurar solo las tablas transaccionales del mÃ³dulo financiero
pg_restore \
  --host="${DB_HOST}" --port="${DB_PORT}" \
  --username="${DB_USER}" --dbname="${DB_NAME}" \
  --no-password \
  --table="FinancialMovement" \
  --table="BankAccount" \
  --table="Transfer" \
  --table="FinancialMovementAttachment" \
  --data-only \
  atlaserp_prod.dump

# 3. Verificar consistencia relacional
psql -U atlaserp -d atlaserp_prod \
  -c "SELECT COUNT(*) FROM \"FinancialMovement\";"
psql -U atlaserp -d atlaserp_prod \
  -c "SELECT COUNT(*) FROM \"BankAccount\";"
```

**Notas:**
- `--data-only` omite DDL (esquema), evitando conflictos con la estructura actual.
- Este procedimiento asume que el esquema ya estÃ¡ en la BD destino (migrado previamente).
- No restaura `User`, `Organization`, ni tablas de otros mÃ³dulos â€” los catÃ¡logos preexistentes se conservan.
- Requiere criterio humano para seleccionar las tablas correctas segÃºn el incidente.

**Resultado del drill (2026-04-18):** Transacciones financieras recuperadas correctamente. Usuarios y configuraciones base intactos. FK constraints respetadas. Prueba APROBADA.

---

## ApÃ©ndice B â€” Restore solo de archivos (MinIO)

Para escenarios donde la BD estÃ¡ Ã­ntegra pero el volumen de archivos fue perdido o corrompido:

```bash
# Revertir sincronizaciÃ³n: traer desde backup remoto hacia MinIO local
rclone sync s3:atlaserp-backups/files/atlaserp-attachments minio:atlaserp-attachments \
  --checksum --transfers 4 --log-level INFO

rclone sync s3:atlaserp-backups/files/atlaserp-receipts minio:atlaserp-receipts \
  --checksum --transfers 4 --log-level INFO

# Verificar conteo de objetos
rclone size minio:atlaserp-attachments
rclone size minio:atlaserp-receipts
```

**Resultado del drill (2026-04-18):** Todos los adjuntos restaurados. URLs firmadas funcionales. Links desde la web app operativos. Prueba APROBADA.

---

## Referencias

- Script de restore: `scripts/restore.sh`
- Script de backup: `scripts/backup_pg.sh`
- PolÃ­tica de backups: `docs/00-canon/13_backup_policy_database.md`
- PolÃ­tica de archivos: `docs/00-canon/14_backup_policy_files.md`
- PolÃ­tica de secretos: `docs/00-canon/15_backup_policy_configs.md`
- Estrategia de restauraciÃ³n: `docs/02-architecture/13-estrategia-restauracion.md`

