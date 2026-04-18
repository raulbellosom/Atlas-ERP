# T-1336 - Crear pruebas de permisos del módulo Financial Operations

## Metadatos
- ID: `T-1336`
- Fase: `Fase 13`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Crear pruebas que validen la correcta aplicación de decoradores `@RequireAllPermissions` en todos los endpoints del módulo Financial Operations Core, la completitud del catálogo de permisos y la coherencia de perfiles de rol operativo.

## Alcance
- Suite de permisos: `finops-permissions.test.ts` (20 tests).
- Valida `@RequireAllPermissions` en los 7 controladores financieros.
- Valida que cada handler tiene los permisos exactos esperados (mapa declarativo).
- Valida perfil tesorero: `finops:*:read` + `finops:*:write`.
- Valida perfil auditor: solo `finops:*:read`, sin permisos `:write`.
- Valida formato de claves de permiso (`finops:<entidad>:<acción>`).
- Valida catálogo de al menos 15 permisos `finops:*`.

## Fuera de alcance
- Pruebas de enforcement real de permisos (guard activo en HTTP) — eso requiere servidor activo.
- Validación de permisos a nivel de base de datos.

## Dependencias
- `T-1332`: permisos integrados en todos los controladores.
- `T-1335`: utilidades de reflexión de test disponibles en la suite de integración.

## Criterios de aceptación
- [x] 7 controladores validados: todos los handlers tienen `@RequireAllPermissions`.
- [x] Permisos exactos verificados por handler (mapa declarativo).
- [x] Perfil tesorero incluye todos los permisos finops read+write.
- [x] Perfil auditor NO incluye permisos `:write`.
- [x] Formato de permisos validado.
- [x] Script `test:finops-permissions` operativo.
- [x] 20/20 pruebas pasan en verde.

## Validaciones
- `pnpm --filter @atlasrep/api run test:finops-permissions` ✅ (20/20).
- `pnpm --filter @atlasrep/api run typecheck` ✅.
- `pnpm --filter @atlasrep/api run lint` ✅.

## Pruebas
- Archivo: `apps/api/src/modules/financial-movements/finops-permissions.test.ts`.
- Runner: `tsx --test` (node:test nativo).
- Total: 20 tests.
- Estrategia: reflexión de metadata de decoradores NestJS (`Reflect.getMetadata`) para verificar permisos aplicados.

## Riesgos
- **Reflexión de metadata de NestJS**: los decoradores de NestJS almacenan metadata en el prototipo del controlador. La reflexión puede ser frágil si la versión de NestJS cambia el key de metadata. Mitigación: documentar el key de metadata utilizado.
- **Mapa de permisos desactualizado**: si se agrega un endpoint nuevo y no se actualiza el mapa declarativo del test, el test seguirá pasando aunque el nuevo endpoint no tenga permiso. Mitigación: el test valida que el número de handlers del controller coincide con el mapa.

## Documentación a actualizar
- `apps/api/src/modules/financial-movements/finops-permissions.test.ts` — archivo nuevo.
- `apps/api/package.json` — script `test:finops-permissions` agregado.

## Decisiones clave
- **Mapa declarativo de permisos esperados**: los tests definen explícitamente qué permiso debe tener cada handler. Esto hace que los tests sean auto-documentados y que cualquier cambio de permiso requiera actualizar el test conscientemente.
- **Validación de perfiles de rol sin BD**: los tests validan los perfiles de rol leyendo el seed de permisos como módulo TypeScript, no consultando la BD. Esto permite ejecutar los tests sin conexión a base de datos.

## Evidencia documental
- `apps/api/src/modules/financial-movements/finops-permissions.test.ts`
- `apps/api/package.json` (script `test:finops-permissions`)

## Pendientes para la siguiente task
- `T-1337` emite la aprobación formal del backend de Fase 13.

## Pendientes no resueltos
- Ninguno.
