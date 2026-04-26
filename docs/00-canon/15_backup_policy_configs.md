# PolÃ­tica de Backup â€” Configuraciones y Variables de Entorno

**VersiÃ³n:** 1.0 **Fecha:** 2026-04-18 **Task origen:** T-2002 (Fase 20
Bloque 1)

---

## Principio fundamental

Las variables de entorno y secretos de producciÃ³n **nunca se almacenan en
Git**. Sin embargo, deben estar respaldados para poder reconstruir el sistema
ante una pÃ©rdida total de infraestructura.

---

## Almacenamiento de secretos

### Gestor de secretos recomendado

| Ambiente    | Almacenamiento                                     | Acceso                   |
| ----------- | -------------------------------------------------- | ------------------------ |
| ProducciÃ³n | AWS Secrets Manager / HashiCorp Vault              | TechLead + 1 backup      |
| Staging     | GitHub Actions Secrets (environment `staging`)     | TechLead + equipo        |
| Desarrollo  | Archivo `.env.local` en mÃ¡quina del desarrollador | Desarrollador individual |

### Variables crÃ­ticas que deben estar respaldadas

| Variable               | DescripciÃ³n                                                         |
| ---------------------- | -------------------------------------------------------------------- |
| `PROD_DATABASE_URL`    | URL completa de conexiÃ³n a PostgreSQL de producciÃ³n                |
| `PROD_REDIS_URL`       | URL de Redis de producciÃ³n                                          |
| `JWT_SECRET`           | Clave de firma de tokens JWT                                         |
| `BACKUP_PASSPHRASE`    | Clave de cifrado de backups de BD                                    |
| `S3_ACCESS_KEY`        | Credencial de acceso a almacenamiento S3-compatible (MinIO en local) |
| `S3_SECRET_KEY`        | Secreto de acceso a almacenamiento S3-compatible (MinIO en local)    |
| `STAGING_DATABASE_URL` | URL de PostgreSQL de staging                                         |
| `STAGING_SSH_KEY`      | Clave SSH privada para deploy a staging                              |
| `PROD_SSH_KEY`         | Clave SSH privada para deploy a producciÃ³n                          |

---

## Procedimiento para reconstruir `.env` en servidor limpio

Si se pierde acceso total al servidor de producciÃ³n y hay que migrar a uno
nuevo:

### Paso 1: Acceder al gestor de secretos

```bash
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id atlaserp-prod --query SecretString --output text

# HashiCorp Vault
vault kv get secret/atlaserp/prod
```

### Paso 2: Crear el archivo `.env` en el nuevo servidor

```bash
# En el nuevo servidor
mkdir -p /opt/atlaserp
vim /opt/atlaserp/.env.prod  # Pegar los valores desde el gestor de secretos
chmod 600 /opt/atlaserp/.env.prod
chown atlaserp:atlaserp /opt/atlaserp/.env.prod
```

### Paso 3: Verificar que la configuraciÃ³n es correcta

```bash
# Probar conexiÃ³n a la base de datos con la nueva configuraciÃ³n
docker run --rm --env-file /opt/atlaserp/.env.prod \
  ghcr.io/{org}/atlaserp-api:latest \
  node -e "require('./dist/main').verifyConfig()"
```

---

## PolÃ­tica de rotaciÃ³n de secretos

| Secreto                      | Frecuencia de rotaciÃ³n              |
| ---------------------------- | ------------------------------------ |
| `JWT_SECRET`                 | Trimestral                           |
| `DATABASE_URL` (contraseÃ±a) | Semestral                            |
| `BACKUP_PASSPHRASE`          | Anual                                |
| Claves SSH de deploy         | Anual o al rotar personas con acceso |
| Credenciales MinIO           | Semestral                            |

Tras cualquier incidente de seguridad o fuga de secreto: **rotaciÃ³n
inmediata**.

---

## Resguardo de emergencia

AdemÃ¡s del gestor de secretos en la nube, el TechLead mantiene una copia
impresa o en almacenamiento cifrado offline (KeePass, 1Password local) de las
credenciales crÃ­ticas para el caso de indisponibilidad del gestor de secretos.

Esta copia offline se actualiza en cada rotaciÃ³n de secretos y se almacena en
ubicaciÃ³n fÃ­sica segura.
