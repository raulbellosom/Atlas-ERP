# T-0528 - Crear modelo Session/RefreshToken según estrategia

## Metadatos
- ID: `T-0528`
- Fase: `Fase 5`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear persistencia base para sesiones autenticadas y refresh tokens con soporte de revocación y rotación.

## Alcance
- Crear modelo `Session` ligado a `Organization`, `User` y opcionalmente `DeviceRegistry`.
- Crear modelo `RefreshToken` ligado a sesión, organización y usuario.
- Definir campos de expiración, revocación, actividad y relación de rotación de tokens.

## Fuera de alcance
- Estrategia final de auth del producto (JWT/cookies/SSO), a cerrar en Fase 7.

## Dependencias
- `T-0521` y `T-0512` cerradas.

## Criterios de aceptación
- [x] Modelos `Session` y `RefreshToken` implementados.
- [x] Índices de consulta por usuario/estado/expiración definidos.
- [x] Relación de rotación de refresh tokens definida.

## Validaciones
- `prisma validate` sin errores.

## Pruebas
- `db:generate` y `db:seed` exitosos.

## Riesgos
- Sin esta base de datos de sesiones, Fase 6/7 de auth queda bloqueada o sin trazabilidad.

## Documentación a actualizar
- `docs/02-architecture/33-prisma-modelos-foundation-sync-auth-notifications.md`
- `prisma/schema.prisma`

## Evidencia documental
- `prisma/schema.prisma`

## Pendientes no resueltos
- Ninguno.
