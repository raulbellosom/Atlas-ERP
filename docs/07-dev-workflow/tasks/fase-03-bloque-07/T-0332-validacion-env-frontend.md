# T-0332 - Crear validación de env vars en frontend

## Metadatos
- ID: `T-0332`
- Fase: `Fase 3`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `FrontendWebAgent`

## Objetivo
Implementar la validacion de variables de entorno Vite en el arranque del frontend React (apps/web), con un modulo `env.js` que valida y exporta las variables tipadas.

## Criterios de aceptación
- [x] `apps/web/src/config/env.js` creado con `validateEnv()` y objeto `env`.
- [x] `validateEnv()` valida VITE_API_URL como obligatoria — lanza Error si falta.
- [x] Objeto `env` exporta las variables tipadas: apiUrl, appName, environment.
- [x] `apps/web/src/main.jsx` llama a `validateEnv()` antes de montar React.
- [x] Error claro en espanol con instrucciones para copiar .env.example.

## Archivos creados/modificados
- `apps/web/src/config/env.js`
- `apps/web/src/main.jsx` — `validateEnv()` llamado al inicio

## Uso en componentes

```js
// En cualquier archivo del frontend:
import { env } from '@/config/env.js';

const response = await fetch(`${env.apiUrl}/auth/login`, { ... });
```

## Decisiones tecnicas
- **JavaScript puro, no TypeScript**: `apps/web` es JS — se usa JSDoc para typing.
- **`import.meta.env`**: API de Vite para variables de entorno en frontend.
- **Objeto `env` re-exportado**: Centraliza el acceso a variables — evita usar `import.meta.env` directamente en componentes.
- **Fail fast en main.jsx**: Si falta VITE_API_URL, la app lanza error antes de montar el DOM — visible inmediatamente en dev.

## Pendientes no resueltos
- Ninguno. Cuando se agreguen nuevas VITE_* variables, actualizar `REQUIRED_ENV_VARS` y el objeto `env`.
