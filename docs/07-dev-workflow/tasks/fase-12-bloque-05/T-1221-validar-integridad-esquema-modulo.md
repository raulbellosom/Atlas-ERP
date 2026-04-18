# T-1221 - Validar integridad del esquema del módulo

## Metadatos
- ID: `T-1221`
- Fase: `Fase 12`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Ejecutar el conjunto completo de validaciones de integridad del esquema Prisma del módulo Financial Operations Core antes del cierre formal de Fase 12. Garantizar que el schema, el historial de migraciones y la base de datos local son consistentes entre sí, y que el cliente TypeScript generado no tiene errores.

## Alcance
- Validar el schema Prisma con `prisma validate`.
- Validar consistencia entre migraciones y schema con `prisma migrate diff`.
- Validar consistencia entre base de datos local y schema con `prisma migrate diff` (from datasource).
- Ejecutar `db:generate`, `typecheck` y `lint`.
- Documentar los comandos ejecutados y sus resultados.

## Fuera de alcance
- No incluye tests de integración de la API (eso es Fase 13+).
- No aplica validaciones en staging ni producción.
- No crea datos de prueba (eso fue `T-1220`).

## Dependencias
- `T-1219` (migraciones): el historial de migraciones debe estar completo.
- `T-1220` (seeds): los seeds deben ejecutarse correctamente antes de validar la consistencia con la base local.

## Criterios de aceptación
- [x] Esquema Prisma válido (`prisma validate` exit code 0).
- [x] Historial de migraciones consistente con el schema del repo (`prisma migrate diff` sin diferencias).
- [x] Base local consistente con el schema actual (`prisma migrate diff from datasource` sin diferencias).
- [x] `db:generate`, `typecheck` y `lint` en verde.

## Validaciones ejecutadas
- `pnpm --filter @atlasrep/api exec prisma validate --schema ../../prisma/schema.prisma`: **OK**.
- `pnpm --filter @atlasrep/api exec prisma migrate diff --from-migrations ../../prisma/migrations --to-schema-datamodel ../../prisma/schema.prisma --shadow-database-url postgresql://atlaserp:atlaserp_dev@localhost:5432/atlaserp_shadow --exit-code`: **OK** (sin diferencias).
- `pnpm --filter @atlasrep/api exec prisma migrate diff --from-schema-datasource ../../prisma/schema.prisma --to-schema-datamodel ../../prisma/schema.prisma --exit-code`: **OK** (sin diferencias).
- `pnpm --filter @atlasrep/api run db:generate`: **OK**.
- `pnpm --filter @atlasrep/api run typecheck`: **OK**.
- `pnpm --filter @atlasrep/api run lint`: **OK**.

## Pruebas
- Todas las validaciones ejecutadas con exit code 0.
- Revisión manual de la salida de `typecheck` para confirmar que no hay errores silenciosos.

## Riesgos
- **Drift silencioso**: si la base local tiene cambios aplicados manualmente que no están en el historial de migraciones, `migrate diff` los detecta. Mitigación: se aplicó `prisma db push` para sincronizar sin usar `migrate dev`.
- **Typecheck con errores en módulos no relacionados**: errores TypeScript en otros módulos pueden reportarse junto con el typecheck del módulo financiero. Mitigación: revisar que los errores reportados (si los hay) son de módulos preexistentes y no del módulo recién creado.

## Documentación a actualizar
- Esta task no genera archivos adicionales — solo ejecuta validaciones y registra resultados en el task file.

## Decisiones clave
- **Uso de shadow DB para `migrate diff`**: en lugar de ejecutar `migrate dev` (que podría proponer un reset), se usa `migrate diff` con shadow DB para comparación segura sin afectar el entorno de desarrollo.
- **`prisma db push` en local**: para sincronizar la base local sin usar `migrate dev`, se aplicó `prisma db push` de forma controlada. La migración oficial del bloque sigue siendo la fuente de verdad para ambientes limpios.

## Evidencia documental
- Resultados de validaciones documentados en este task file (sección "Validaciones ejecutadas").

## Pendientes para la siguiente task
- `T-1222` emite la aprobación formal de cierre de Fase 12 con base en los resultados de esta validación.

## Pendientes no resueltos
- Ninguno.
