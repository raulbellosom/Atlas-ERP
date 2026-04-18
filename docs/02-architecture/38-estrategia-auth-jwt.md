# 38 — Estrategia de autenticación JWT (Fase 7)

## Contexto

En Fase 6 se estableció el contrato contractual de auth (stubs NotImplementedException) y la capa de sesiones (`SessionsService`). En Fase 7 se implementa la autenticación real.

## Decisión

### Esquema de tokens

| Token | Algoritmo | TTL | Almacenamiento |
|-------|-----------|-----|----------------|
| Access Token | HS256 (JWT) | 15 minutos | Solo cliente (Bearer header) |
| Refresh Token | SHA-256 hash aleatorio | 7 días | BD (`RefreshToken.tokenHash`) |

**Access Token claims:**
```json
{
  "sub": "<userId>",
  "organizationId": "<organizationId>",
  "branchId": "<branchId|null>",
  "iat": 1234567890,
  "exp": 1234568790
}
```

El access token **no incluye roles/permisos** — los permisos se consultan en cada request desde BD o cache (Fase 8+).

### Flujo login
1. Cliente envía `POST /v1/auth/login` con `{ organizationId, email, password }`.
2. AuthService busca usuario activo por `(organizationId, email)`.
3. Verifica `password` contra `User.passwordHash` (bcryptjs cost 12).
4. Si correcto: crea `Session`, emite access token (HS256) + refresh token (hash SHA-256 aleatorio).
5. Guarda `RefreshTokenRecord` en BD con `tokenHash`.
6. Devuelve `{ accessToken, refreshToken, expiresIn }`.

### Flujo refresh
1. Cliente envía `POST /v1/auth/refresh` con `{ refreshToken }`.
2. AuthService busca `RefreshToken` por hash → valida ACTIVE y no expirado.
3. Rota: invalida el token anterior (ROTATED), crea uno nuevo.
4. Emite nuevo access token.

### Flujo logout
1. Cliente envía `POST /v1/auth/logout` (Bearer requerido) con `{ sessionId?, allSessions? }`.
2. `SessionsService.revokeSession()` o `revokeAllUserSessions()`.

### Flujo GET /auth/me
1. `JwtAuthGuard` verifica y decodifica el access token.
2. Busca usuario en BD por `sub`.
3. Devuelve perfil completo con roles.

### Hashing de contraseñas

- Algoritmo: **bcryptjs** (cost factor 12).
- Campo: `User.passwordHash String?` (nullable para usuarios sin credenciales aún).
- Nunca loggear la contraseña en claro ni el hash.

### Almacenamiento de credenciales

El campo `passwordHash` vive directamente en el modelo `User` para simplificar joins. Si en el futuro se necesita soporte multi-proveedor (OAuth, SAML), se puede refactorizar a un modelo `Credential` separado sin romper la API.

### Bootstrap del usuario root

Se levanta mediante seeder (`prisma/seeds/`). El seed detecta si ya existe un usuario root y lo omite (idempotente).

### Recuperación de contraseña

Modelo `PasswordResetToken` con:
- `tokenHash` único (SHA-256 del token enviado por email).
- `expiresAt` (15 minutos).
- `usedAt DateTime?` — se marca al usar.

El envío de email está fuera de alcance de Fase 7 (se agrega en Fase 8+). El endpoint de reset solo existe a nivel contractual por ahora.

## Alternativas rechazadas

- **Passport.js**: agrega abstracción innecesaria para un solo proveedor JWT. Se usa `@nestjs/jwt` directo.
- **Argon2**: mejor seguridad pero requiere binarios nativos que complican el build en Windows. bcryptjs es pure JS y suficiente.
- **Access tokens de larga duración**: descartado por riesgo de seguridad. Se usa refresh token + rotación.

## Consecuencias

- `@nestjs/jwt` y `bcryptjs` se agregan a `apps/api/package.json`.
- Se agrega `passwordHash` y `isLocked` a `User` en Prisma schema (migración nueva).
- Se agrega modelo `PasswordResetToken` al schema.
- `JwtAuthGuard` pasa de contractual a real verificación HS256.
- `AuthService.login()` implementa flujo real (T-0701).
