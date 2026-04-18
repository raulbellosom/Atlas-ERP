# T-0042 - Definir estrategia de backup minima obligatoria

## Metadatos
- ID: `T-0042`
- Fase: `Fase 0`
- Bloque: `Bloque 9`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir que datos se respaldan, con que frecuencia, cuanto tiempo se retienen y donde se almacenan los backups, garantizando recuperabilidad ante perdida de datos.

## Alcance
- Definir que entra en el alcance del backup (PostgreSQL, MinIO, configuracion critica).
- Definir que queda excluido del backup central (SQLite local, Redis, imagenes Docker).
- Definir frecuencia minima por ambiente.
- Definir retencion minima por tipo y ambiente.
- Definir requisitos de almacenamiento y verificacion.

## Fuera de alcance
- Implementacion de scripts de backup (se delega a Fase 4 de infraestructura).
- Configuracion de herramientas especificas de backup (pg_dump, restic, etc.).
- Restauracion: se cubre en `T-0043`.

## Dependencias
- `T-0041` cerrada (la estrategia de secretos define como se protegen las credenciales usadas por el proceso de backup).

## Criterios de aceptacion
- [x] Alcance del backup definido (que entra y que no).
- [x] Frecuencia minima por ambiente documentada.
- [x] Retencion minima por tipo y ambiente documentada.
- [x] Requisitos de almacenamiento documentados (ubicacion, cifrado).
- [x] Politica de verificacion de backup documentada.
- [x] Responsable del proceso identificado.

## Validaciones
- La politica debe ser coherente con los objetivos de RPO definidos en `T-0043`.
- SQLite local debe quedar explicitamente excluido del backup central.

## Pruebas
- Prueba documental: verificar que la frecuencia cubre el RPO objetivo.
- Revision de coherencia con estrategia de restauracion (`T-0043`).

## Riesgos
- Sin backup de PostgreSQL, una perdida de datos es irrecuperable.
- Backups sin verificacion pueden ser corruptos y no detectarse hasta el momento del restore.

## Documentacion a actualizar
- `docs/02-architecture/12-estrategia-backup.md`
- `docs/02-architecture/README.md`

## Decisiones clave
- PostgreSQL es el dato mas critico: requiere backup diario en prod mas WAL continuo.
- SQLite local no es dato critico central: no aplica backup desde el servidor.
- Los backups deben almacenarse fuera del servidor principal, cifrados.

## Evidencia documental
- `docs/02-architecture/12-estrategia-backup.md`

## Pendientes para la siguiente task
- Iniciar `T-0043` (estrategia de restauracion minima obligatoria).

## Pendientes no resueltos
- Ninguno.
