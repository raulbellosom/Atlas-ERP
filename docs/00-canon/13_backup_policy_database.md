# PolÃ­tica de Backup â€” Base de Datos PostgreSQL

**VersiÃ³n:** 1.0
**Fecha:** 2026-04-18
**Task origen:** T-2000 (Fase 20 Bloque 1)

---

## Objetivos de recuperaciÃ³n

| MÃ©trica | Objetivo | DescripciÃ³n |
|---------|---------|-------------|
| **RPO** (Recovery Point Objective) | MÃ¡ximo 24 horas | La pÃ©rdida mÃ¡xima aceptable de datos transaccionales es de 1 dÃ­a |
| **RTO** (Recovery Time Objective) | MÃ¡ximo 4 horas | El tiempo mÃ¡ximo para tener el sistema operativo tras un desastre es de 4 horas |

---

## Estrategia de backup

### Tipo de backup

**Backup lÃ³gico con `pg_dump`** â€” genera un archivo SQL o formato custom que puede restaurarse en cualquier instancia PostgreSQL compatible.

En v1: backups lÃ³gicos diarios. Cuando el volumen de datos lo justifique (>10 GB o RPO < 1 hora): aÃ±adir **WAL archiving** con `pg_basebackup` para backups continuos y point-in-time recovery.

### Frecuencia

| Ambiente | Frecuencia | Hora (UTC) |
|---------|-----------|-----------|
| ProducciÃ³n | Diario | 02:00 UTC |
| Staging | Semanal | Domingo 03:00 UTC |

### Formato y compresiÃ³n

- Formato: `pg_dump -Fc` (custom format â€” mÃ¡s eficiente que SQL plano, permite restore selectivo).
- CompresiÃ³n: nivel 9 (mÃ¡ximo â€” PostgreSQL custom format comprime internamente).
- Nombre del archivo: `atlaserp_prod_YYYY-MM-DD_HH-MM.dump`.

### Cifrado

Los archivos de backup se cifran en reposo usando AES-256 antes de subirse al almacenamiento remoto:
```bash
gpg --symmetric --cipher-algo AES256 --batch --passphrase "$BACKUP_PASSPHRASE" \
    atlaserp_prod_YYYY-MM-DD.dump
```

La clave de cifrado (`BACKUP_PASSPHRASE`) se almacena en el gestor de secretos de producciÃ³n, separada de las credenciales de la base de datos.

---

## Almacenamiento remoto (off-site)

Los backups deben almacenarse en una ubicaciÃ³n **diferente del servidor de producciÃ³n**:

- **OpciÃ³n A:** Bucket S3/MinIO dedicado exclusivamente a backups (diferente instancia que la de producciÃ³n).
- **OpciÃ³n B:** Servicio de backup externo (Backblaze B2, AWS S3 Glacier, etc.).

Regla: el servidor de producciÃ³n no debe poder eliminar backups pasados â€” el acceso al bucket de backups es solo de escritura (append-only) desde el servidor.

---

## PolÃ­tica de retenciÃ³n

| Periodo | RetenciÃ³n |
|---------|-----------|
| Backups diarios | 30 dÃ­as |
| Ãšltimo backup de cada semana | 90 dÃ­as |
| Ãšltimo backup de cada mes | 1 aÃ±o |

Purga automÃ¡tica: implementada en T-2005.

---

## Notificaciones de fallo

Si el backup no se ejecuta o genera un error, se debe notificar al equipo en menos de 1 hora:

1. El script de backup devuelve exit code no-zero en caso de error.
2. El cron job captura el error y envÃ­a un email/Slack alert al equipo de operaciones.
3. El log del backup se almacena localmente y en el bucket de backups.

---

## VerificaciÃ³n de integridad

DespuÃ©s de cada backup:
```bash
pg_restore --list atlaserp_prod_YYYY-MM-DD.dump > /dev/null
echo "Exit code: $?"  # 0 = backup vÃ¡lido
```

Una vez por semana: restaurar el backup en un entorno de test para verificar que los datos son coherentes (ver estrategia de restauraciÃ³n en `docs/02-architecture/13-estrategia-restauracion.md`).

---

## Acceso a backups

- Solo el equipo de operaciones tiene acceso al bucket de backups.
- Cualquier acceso al bucket de backups debe quedar registrado en el log de auditorÃ­a del servicio de almacenamiento.
- La clave de descifrado de backups se almacena en el gestor de secretos con acceso restringido a 2 personas (TechLead + backup de TechLead).

