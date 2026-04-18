# T-0706 - Implementar registro de devices

## Metadatos
- ID: `T-0706`
- Fase: `Fase 7`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Habilitar el tracking de dispositivos por sesion. El modelo DeviceRegistry ya existe en el schema para registro avanzado de dispositivos moviles (con clientId, deviceName, platform, appVersion). En este bloque se expone la informacion de dispositivo (userAgent, ipAddress) via el endpoint de sesiones.

## Alcance
- El endpoint `GET /v1/sessions` ya retorna `userAgent` e `ipAddress` como informacion de dispositivo.
- El modelo `DeviceRegistry` en schema soporta registro avanzado para clientes moviles (con clientId unico, deviceName, platform).
- Las sesiones se vinculan opcionalmente a un `DeviceRegistry` via `deviceRegistryId`.
- El registro completo de devices (clientId + fingerprint) queda para implementacion en el modulo de sincronizacion movil (Fase posterior).

## Resultados
- GET /v1/sessions expone `userAgent` y `ipAddress` como informacion de dispositivo.
- Modelo DeviceRegistry disponible en schema para uso en Fase posterior.

## Criterios de aceptacion
- [x] GET /v1/sessions incluye userAgent e ipAddress por sesion.
- [x] DeviceRegistry model en schema con clientId @unique, deviceName, platform, appVersion.
- [x] Sessions vinculables a DeviceRegistry via deviceRegistryId.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Registro de dispositivos moviles con fingerprint unico (requiere modulo de sync).
- Endpoint CRUD de DeviceRegistry (Fase posterior).

## Dependencias
- T-0705 cerrada (endpoint GET /v1/sessions).

## Pendientes no resueltos
- Registro avanzado de devices moviles diferido a modulo de sync (Fase posterior).
