# Blueprint Técnico: Backups y Restore

## Identificación
- Directorio: `infra/backup/`
- Herramientas: pg_dump, scripts de MinIO sync, gestión via cron o worker

## Propósito
Implementar de forma concreta la estrategia de backup y restauración definida en la política (`docs/02-architecture/12-estrategia-backup.md` y `docs/02-architecture/13-estrategia-restauracion.md`).

## Componentes a respaldar

| Componente | Método | Frecuencia prod | Herramienta |
|------------|--------|----------------|-------------|
| PostgreSQL (full) | `pg_dump` con compresión | Diaria 02:00 UTC | Script + cron |
| PostgreSQL (WAL) | `pg_basebackup` + streaming | Continuo | pgWAL / Barman |
| Archivos MinIO | `mc mirror` al destino | Diaria 03:00 UTC | MinIO Client |
| Configuración crítica | Snapshot manual | Semanal | Script |

## Estructura de scripts

```
infra/backup/
├─ scripts/
│  ├─ backup-postgres.sh     # Dump + compresión + checksum + upload a destino
│  ├─ backup-minio.sh        # Mirror de buckets a almacenamiento externo
│  └─ restore-postgres.sh    # Restore desde backup con validación de integridad
├─ README.md                 # Instrucciones de uso
└─ .env.example              # Variables necesarias para los scripts
```

## Flujo de backup PostgreSQL

```bash
# backup-postgres.sh (pseudocódigo)
1. Ejecutar pg_dump -Fc -Z9 hacia archivo temporal
2. Calcular checksum SHA256 del archivo
3. Subir archivo + checksum a almacenamiento externo
4. Verificar que el upload fue exitoso
5. Registrar resultado en log de backups
6. Limpiar backups con más de RETENTION_DAYS días
```

## Flujo de restore PostgreSQL (mínimo)

```bash
# restore-postgres.sh (pseudocódigo)
1. Descargar backup del almacenamiento externo
2. Verificar checksum SHA256
3. Levantar PostgreSQL limpio
4. Ejecutar pg_restore
5. Verificar integridad (contar registros clave)
6. Documentar resultado
```

## Variables de entorno de los scripts

- `POSTGRES_URL` — cadena de conexión origen
- `BACKUP_DESTINATION` — URL del destino del backup (S3, SFTP, etc.)
- `BACKUP_ENCRYPTION_KEY` — clave de cifrado (si se usa)
- `RETENTION_DAYS` — días de retención (30 en prod)
- `MINIO_SOURCE_URL` / `MINIO_DEST_URL` — para el mirror

## Nota de implementación
Los scripts concretos se implementan en Fase 4 (`T-0400+`). Este blueprint define la estructura y el flujo esperado.
