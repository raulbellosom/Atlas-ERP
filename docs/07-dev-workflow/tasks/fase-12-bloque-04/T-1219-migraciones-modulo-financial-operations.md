# T-1219 - Crear migraciones del módulo Financial Operations Core

## Metadatos
- ID: `T-1219`
- Fase: `Fase 12`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Generar y registrar la migración SQL que materializa en la base de datos todos los modelos y enums creados en el Bloque 4 (`T-1215` a `T-1218`). Esta migración es el artefacto de versión de esquema que permite reproducir el estado del módulo en cualquier ambiente limpio.

## Alcance
- Generar migración SQL para los cambios acumulados de `T-1215` a `T-1218`.
- Registrar la carpeta de migración en `apps/api/prisma/migrations/` con naming convencional de Prisma.
- Validar la consistencia del historial de migraciones contra `schema.prisma` (sin drift).
- Ejecutar `prisma generate`, `typecheck` y `lint` post-migración.

## Fuera de alcance
- No incluye seeds de datos demo (eso es `T-1220`).
- No incluye la migración de los bloques 1 a 3 de Fase 12 — esos cambios fueron incorporados al schema antes de este bloque.
- No aplica la migración a ambientes de staging o producción (eso es el proceso de CI/CD).

## Dependencias
- `T-1215` a `T-1218`: todos los modelos del Bloque 4 deben estar en el schema antes de generar la migración.
- PostgreSQL local (`atlaserp_dev` y `atlaserp_shadow`): necesarios para generación de migración segura.

## Criterios de aceptación
- [x] Carpeta de migración creada: `apps/api/prisma/migrations/20260414001955_fase12_bloque04_financial_lite_enums/`.
- [x] Archivo `migration.sql` generado con creación de modelos `CounterpartyLite`, `ReceivableLite`, `PayableLite` y enums del bloque.
- [x] `prisma migrate diff --from-migrations ... --to-schema-datamodel ... --exit-code`: sin diferencias.
- [x] `prisma generate`, `typecheck` y `lint` en verde.

## Validaciones
- `pnpm prisma migrate diff --from-migrations ../../prisma/migrations --to-schema-datamodel ../../prisma/schema.prisma --shadow-database-url postgresql://... --exit-code` — sin diferencias (exit code 0).
- `pnpm prisma validate` — schema válido.
- Revisión manual de `migration.sql` para confirmar que contiene CREATE TABLE y CREATE TYPE para los nuevos modelos/enums.

## Pruebas
- Aplicar la migración en ambiente local con `prisma db push` o `prisma migrate deploy`.
- Confirmar que las tablas y enums aparecen en la base de datos local.
- Ejecutar `db:seed` después de la migración para verificar que los seeds funcionan sobre el nuevo schema.

## Riesgos
- **Drift histórico**: el entorno local puede tener un schema que difiere del historial de migraciones por cambios manuales anteriores. Mitigación: se usó `prisma migrate diff` con shadow DB (`atlaserp_shadow`) para generar el SQL de migración de forma segura sin hacer reset de la base local.
- **Migración destructiva accidental**: si se ejecuta `prisma migrate dev` en un entorno con drift, Prisma puede proponer resetear la base. Mitigación: usar siempre `prisma migrate diff` y aplicar manualmente en entornos con datos existentes.

## Documentación a actualizar
- `apps/api/prisma/migrations/` — nueva carpeta de migración del bloque.

## Decisiones clave
- **Shadow DB para generación segura**: se usó la base de datos shadow `atlaserp_shadow` para generar la migración sin afectar el entorno local de desarrollo `atlaserp_dev`. Esto evitó un reset destructivo.
- **Naming de migración**: se usa el timestamp automático de Prisma seguido del descriptor `fase12_bloque04_financial_lite_enums` para identificar el origen y contenido de la migración.

## Evidencia documental
- `apps/api/prisma/migrations/20260414001955_fase12_bloque04_financial_lite_enums/migration.sql`.

## Pendientes para la siguiente task
- `T-1220` (Bloque 5) implementa los seeds de datos demo del módulo sobre el schema ya migrado.

## Pendientes no resueltos
- Ninguno.
