# task-block-58 — Fase 7 Bloque 2: Sesiones, devices, lockout, activacion y roles jerarquicos

## Estado: CERRADO

## Tasks del bloque
| Task | Titulo | Estado |
|------|--------|--------|
| T-0705 | Implementar expiracion y revocacion de sesiones | closed |
| T-0706 | Implementar registro de devices | closed |
| T-0707 | Implementar bloqueo de usuarios | closed |
| T-0708 | Implementar activacion/desactivacion de usuarios | closed |
| T-0709 | Implementar roles jerarquicos | closed |

## Resumen de implementacion

### Nuevos archivos
- `apps/api/src/modules/sessions/sessions.controller.ts` — GET /v1/sessions (lista sesiones activas del usuario), DELETE /v1/sessions/:id (revocar sesion)

### Archivos modificados
- `apps/api/src/modules/sessions/sessions.module.ts` — agrega SessionsController
- `apps/api/src/modules/users/users.service.ts` — lockUser, unlockUser, activateUser, deactivateUser (revoca sesiones al bloquear/desactivar)
- `apps/api/src/modules/users/users.controller.ts` — POST /v1/users/:id/lock, POST /v1/users/:id/unlock, POST /v1/users/:id/activate, DELETE /v1/users/:id/deactivate
- `apps/api/src/modules/users/users.module.ts` — importa SessionsModule
- `apps/api/src/modules/roles/roles.service.ts` — agrega level, parentRoleId a RoleSummary; findEffectivePermissionKeys con resolucion recursiva de ancestros
- `prisma/schema.prisma` — Role.level Int @default(0), Role.parentRoleId String?, relacion "RoleHierarchy"
- `prisma/seeds/roles.seed.ts` — level 100 para admin, 50 para tesorero/auditor

### Esquema de roles jerarquicos
- `admin`: level 100, sin padre (rol raiz)
- `tesorero`: level 50, sin padre (operativo)
- `auditor`: level 50, sin padre (consulta)
- `findEffectivePermissionKeys(roleIds)` recorre la cadena de padres para acumular permisos heredados

### Device tracking
- Sessions ya contienen `userAgent` e `ipAddress` como informacion de dispositivo
- El modelo `DeviceRegistry` existe en schema para registro avanzado de dispositivos moviles (Fase posterior)
- El endpoint GET /v1/sessions retorna `userAgent`, `ipAddress`, `status`, `lastActivityAt`, `expiresAt`

## Smoke test Bloque 2
- GET /v1/sessions → lista 5 sesiones activas del admin con device info ✅
- GET /v1/roles → roles con level (admin:100, auditor:50, tesorero:50) ✅
- POST /v1/users/:id/lock → isLocked:true, sesiones revocadas ✅
- GET /v1/users/:id → isLocked:true verificado ✅
- POST /v1/users/:id/unlock → isLocked:false ✅

## Validaciones
- `lint` ✅
- `typecheck` ✅
- `build` ✅
- smoke test ✅

## Fecha de cierre
2026-04-13
