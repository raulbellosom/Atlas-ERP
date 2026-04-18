# T-0700 - Definir estrategia final de auth (ADR)

## Metadatos
- ID: `T-0700`
- Fase: `Fase 7`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Documentar en un ADR formal la estrategia de autenticación y autorización adoptada para AtlasERP: JWT HS256, refresh tokens opacos hasheados, sesiones en PostgreSQL, y bcryptjs para hashing de contraseñas.

## Alcance
- Crear `docs/02-architecture/38-estrategia-auth-jwt.md` con:
  - Decisión de usar JWT HS256 (access token 15 min) + SHA-256 refresh token opaco (7 días).
  - Justificación de bcryptjs (pure JS, sin native bindings, cost 12).
  - Modelo `PasswordResetToken` con token hash + TTL 15 min.
  - Flujo completo: login → session → access token + refresh token.
  - Política de rotación de refresh token (one-time use).
  - Forward reference a T-0701 para implementación.

## Resultados
- `docs/02-architecture/38-estrategia-auth-jwt.md` creado con contenido completo.
- Justificación técnica de cada decisión documentada.
- Modelo de datos de sesión y reset token descrito.

## Criterios de aceptación
- [x] ADR creado con título, contexto, decisión, consecuencias.
- [x] Estrategia JWT HS256 + refresh opaco documentada.
- [x] bcryptjs cost factor 12 justificado.
- [x] Modelo PasswordResetToken descrito con TTL.
- [x] Sin errores de encoding UTF-8.

## Fuera de alcance
- Implementación de código (T-0701 a T-0704).

## Dependencias
- T-0646 cerrada (aprobación Fase 6).

## Pendientes no resueltos
- Ninguno.
