# Estrategia de Backup Minima Obligatoria

## ID de estrategia
- Task origen: `T-0042`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir que se respalda, con que frecuencia, cuanto tiempo se retiene y donde se almacena, garantizando que AtlasERP pueda recuperarse ante perdida de datos sin depender de improvisacion.

## Alcance del backup

### Incluido
- **PostgreSQL**: base de datos central, fuente oficial de verdad del sistema.
- **Archivos en MinIO/S3**: adjuntos de movimientos, comprobantes y documentos del modulo financiero y futuros.
- **Configuracion critica**: archivos de configuracion de infraestructura que no esten en git (variables de entorno de prod, certificados TLS).

### Excluido
- **SQLite local de desktop**: es cache transitoria del cliente. No aplica backup central. El servidor es la fuente de verdad.
- **Redis**: usado como cache/cola. Los datos criticos de cola deben sobrevivir en PostgreSQL; si no, el diseno es incorrecto.
- **Imagenes Docker**: se reconstruyen desde el registro de imagenes o desde el repositorio.

## Frecuencia minima

| Ambiente | PostgreSQL | Archivos MinIO | Configuracion |
|----------|-----------|---------------|--------------|
| Produccion | Diaria (full) + WAL continuo | Diaria | Semanal |
| Staging | Semanal | Semanal | Mensual |
| Desarrollo local | No aplica backup central | No aplica | No aplica |

## Retencion minima

| Tipo | Produccion | Staging |
|------|-----------|---------|
| Backups diarios PostgreSQL | 30 dias | 7 dias |
| WAL/point-in-time | 7 dias | No aplica |
| Archivos MinIO | 30 dias | 7 dias |
| Configuracion critica | 90 dias | 30 dias |

## Almacenamiento del backup
- Fuera del mismo servidor donde corren los servicios: nunca en el mismo disco/VM que PostgreSQL.
- Encriptado en reposo (AES-256 o equivalente).
- Preferir almacenamiento en proveedor diferente al principal (p.ej. backup en S3 diferente al MinIO operativo).
- Acceso restringido: solo personal autorizado y procesos automatizados del gestor de backups.

## Verificacion de backup
- Tras cada backup exitoso: generar y registrar checksum del archivo.
- El sistema de backup debe reportar exito o falla de cada ciclo.
- Alertas automaticas si el backup no se ejecuta en la ventana esperada.

## Responsable
- DevOps/infraestructura es el owner del proceso de backup.
- El equipo de backend es responsable de declarar que datos son criticos para respaldar.

## Nota de implementacion
La implementacion concreta de scripts de backup se desarrolla en la Fase 4 (`T-0400+`) e infraestructura. Este documento define la politica obligatoria que debe cumplir cualquier implementacion.
