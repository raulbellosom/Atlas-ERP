# T-0401 - Definir servicios que NO correrán en Docker

## Metadatos
- ID: `T-0401`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Documentar explicitamente cuales servicios nunca se ejecutan en Docker y por que, para evitar errores de configuracion en CI/CD o en el setup de nuevos desarrolladores.

## Criterios de aceptación
- [x] `apps/desktop` — documentado como NO dockerizable (binario nativo Tauri).
- [x] Servidores de desarrollo (NestJS watch, Vite) — documentados como ejecutables en host en dev.
- [x] Justificaciones tecnicas registradas por cada exclusion.
- [x] Referencia a `docs/02-architecture/19-servicios-docker.md` (T-0400).

## Servicios que NO corren en Docker

| Servicio              | Motivo tecnico                                                             | Alternativa                        |
| --------------------- | -------------------------------------------------------------------------- | ---------------------------------- |
| `apps/desktop`        | Tauri requiere el entorno grafico del SO — no tiene sentido headless       | Distribuir como instalador nativo  |
| `nest start --watch`  | Hot-reload de NestJS requiere acceso al filesystem del host                | Solo en dev — en prod usa Dockerfile |
| `vite` (dev server)   | HMR requiere WebSocket directo con el browser del desarrollador            | Solo en dev — en prod build estatico en nginx |
| `tauri dev`           | Requiere GPU/display del host para renderizar la webview                   | Solo se construye con `tauri build` |

## Regla de clasificacion

Un servicio NO se dockeriza en desarrollo si:
1. Requiere acceso al hardware del host (GPU, pantalla, filesystem con watch).
2. Su containerizacion degradaria significativamente la experiencia del desarrollador (hot-reload, debugging).
3. Es un binario de distribucion para usuario final (desktop Tauri).

## Archivos modificados
- Ninguno nuevo — decision ya incluida en `docs/02-architecture/19-servicios-docker.md`.

## Pendientes no resueltos
- Ninguno.
