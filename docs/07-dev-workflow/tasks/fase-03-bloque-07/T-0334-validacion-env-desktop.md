# T-0334 - Crear validación de env vars en desktop

## Metadatos
- ID: `T-0334`
- Fase: `Fase 3`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DesktopAgent`

## Objetivo
Implementar la validacion de variables de entorno Vite en el arranque del desktop (apps/desktop), con un modulo `env.js` que valida y exporta las variables del cliente embebido en Tauri.

## Criterios de aceptación
- [x] `apps/desktop/src/config/env.js` creado con `validateEnv()` y objeto `env`.
- [x] `validateEnv()` valida VITE_API_URL como obligatoria.
- [x] Objeto `env` exporta: apiUrl, appName, environment, dataDir.
- [x] `apps/desktop/src/main.jsx` llama a `validateEnv()` antes de montar React.
- [x] `dataDir` es opcional (Tauri puede usar el directorio del sistema por defecto).

## Archivos creados/modificados
- `apps/desktop/src/config/env.js`
- `apps/desktop/src/main.jsx` — `validateEnv()` llamado al inicio

## Contexto especial del desktop

A diferencia del web, el desktop puede operar **offline** — pero necesita `VITE_API_URL` para sincronizar cuando recupera conexion. La validacion al arranque asegura que la configuracion este presente aunque no haya conexion activa.

La configuracion nativa de Tauri (rutas de datos, preferencias del usuario) se maneja en SQLite local, no en variables de entorno.

## Decisiones tecnicas
- **`DESKTOP_DATA_DIR` es opcional**: Si esta vacio, Tauri determina el directorio automaticamente segun el OS (`~/.atlasrep` en Linux/Mac, `%APPDATA%\atlasrep` en Windows).
- **Mismo patron que apps/web**: Mismo archivo env.js, misma estructura — facilita el mantenimiento.
- **No usar variables de entorno para credenciales nativas**: Las credenciales de sincronizacion se guardan en almacenamiento seguro de Tauri (`tauri-plugin-store`), no en `.env`.

## Pendientes no resueltos
- La inicializacion de SQLite local y almacenamiento seguro se implementa en Fase 6 (DesktopAgent).
