# PolÃ­tica de Backup â€” Archivos (MinIO/S3)

**VersiÃ³n:** 1.0
**Fecha:** 2026-04-18
**Task origen:** T-2001 (Fase 20 Bloque 1)

---

## Objetivos de recuperaciÃ³n

| MÃ©trica | Objetivo |
|---------|---------|
| **RPO** | MÃ¡ximo 24 horas |
| **RTO** | MÃ¡ximo 8 horas (restauraciÃ³n de archivos es mÃ¡s lenta que BD) |

El RPO para archivos (adjuntos, comprobantes, documentos) puede ser mayor que el de la base de datos porque los archivos son mÃ¡s estÃ¡ticos y su pÃ©rdida tiene menor impacto operativo inmediato que la pÃ©rdida de transacciones.

---

## Estrategia de backup

### Herramienta recomendada: `rclone`

`rclone` es una herramienta de lÃ­nea de comandos que sincroniza buckets MinIO/S3 a destinos remotos de forma incremental y eficiente.

```bash
# SincronizaciÃ³n incremental del bucket de adjuntos
rclone sync minio:atlaserp-attachments s3:atlaserp-backup-files/attachments \
  --checksum \
  --log-level INFO \
  --log-file /var/log/atlaserp/backup-files.log
```

### Frecuencia

| Bucket | Frecuencia | Hora (UTC) |
|--------|-----------|-----------|
| `atlaserp-attachments` (adjuntos financieros) | Diario | 03:00 UTC |
| `atlaserp-receipts` (comprobantes generados) | Diario | 03:30 UTC |

### Destino

Bucket S3 off-site dedicado a backups de archivos, diferente del bucket de backups de PostgreSQL. La regiÃ³n del bucket de backups debe ser diferente a la de producciÃ³n (geo-redundancia).

---

## Cifrado

Los archivos se almacenan en MinIO de producciÃ³n con cifrado AES-256 en servidor (SSE-S3). El bucket de backups debe tener el mismo nivel de cifrado habilitado.

Si el servicio de almacenamiento de backups no soporta SSE, cifrar con rclone antes del upload:
```bash
rclone sync minio:atlaserp-attachments s3crypt:atlaserp-backup-files/attachments
```

---

## PolÃ­tica de retenciÃ³n

| Tipo de archivo | RetenciÃ³n |
|----------------|-----------|
| Adjuntos financieros | 5 aÃ±os (requisito fiscal) |
| Comprobantes de movimientos | 5 aÃ±os |
| Exportaciones generadas por usuario | 90 dÃ­as |

Los archivos fiscales deben retenerse segÃºn la normativa local (tÃ­picamente 5-7 aÃ±os).

---

## VerificaciÃ³n

Mensualmente: verificar que 5 archivos aleatorios del bucket de backup son descargables e Ã­ntegros:
```bash
rclone check minio:atlaserp-attachments s3:atlaserp-backup-files/attachments --checksum
```

---

## Acceso

- El bucket de backups de archivos tiene polÃ­tica de solo-escritura para el servidor de producciÃ³n.
- Los administradores pueden leer (para restaurar), pero no pueden eliminar sin aprobaciÃ³n de 2 personas.

