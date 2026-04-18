# T-0725 - Pruebas de seguridad básicas

## Metadatos
- ID: `T-0725`
- Fase: `Fase 7`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Ejecutar smoke tests de seguridad para verificar que todos los controles de Fase 7 funcionan correctamente en un entorno de ejecución real.

## Alcance
Verificar manualmente los siguientes escenarios mediante curl:

1. **Endpoint público accesible sin token**: `GET /api/v1/auth/status` → 200.
2. **Endpoint protegido sin token**: `GET /api/v1/audit/logs` → 401 (JwtAuthGuard).
3. **Login exitoso**: `POST /api/v1/auth/login` con credenciales válidas → 200 + accessToken.
4. **Endpoint protegido con token válido**: `GET /api/v1/auth/me` → 200.
5. **Audit logs con token de admin**: `GET /api/v1/audit/logs` → 200 (permisos resueltos desde DB).
6. **Token inválido**: `GET /api/v1/auth/me` con token falso → 401.
7. **Rate limiting**: 11 POSTs a `/api/v1/auth/login` desde misma IP → primeros 10 pasan (400/200), 11° retorna 429.

## Resultados
- Todos los escenarios produjeron los resultados esperados.
- Rate limit: conteo compartido entre comandos en la misma sesión; la 429 apareció correctamente en el exceso sobre el límite de 10.

## Criterios de aceptacion
- [x] 401 sin token en endpoint protegido.
- [x] 200 con token válido.
- [x] 401 con token inválido.
- [x] 429 tras superar el límite de rate limit (10/min en login).
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Tests automatizados con Jest/Supertest (diferidos a fases de testing).
- Pruebas de penetración (pen-testing) avanzadas.

## Dependencias
- T-0720 a T-0724 (todos los controles de seguridad de Bloque 5).
