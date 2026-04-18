# Blueprint Técnico: Web App

## Identificación
- Aplicación: `apps/web`
- Tecnologías: React + Vite + JavaScript + TailwindCSS 4.1
- Modo: SPA / PWA

## Propósito
Interfaz web principal del sistema AtlasERP. Es la superficie primaria de uso para usuarios en navegador. Comparte componentes con la app desktop via `packages/ui`.

## Estructura de carpetas esperada

```
apps/web/
├─ src/
│  ├─ app/              # Configuración raíz: router, providers, layout
│  ├─ modules/          # Un directorio por módulo de negocio
│  │  ├─ auth/
│  │  ├─ financial/
│  │  └─ ...
│  ├─ shared/           # Componentes, hooks y utilidades compartidas dentro de web
│  └─ assets/
├─ public/
├─ index.html
├─ vite.config.js
├─ tailwind.config.js
└─ .env.example
```

## Módulos de UI por módulo de negocio

Cada módulo de negocio en `src/modules/<nombre>/` contiene:
- `pages/` — pantallas completas (rutas)
- `components/` — componentes específicos del módulo
- `hooks/` — lógica de estado y llamadas a API
- `api/` — llamadas al SDK interno

## Routing
- Basado en React Router v6+
- Rutas protegidas por rol usando el sistema de Auth del Core Platform
- Naming de rutas según `docs/02-architecture/` (kebab-case, por módulo)

## Estados obligatorios de UI
Toda pantalla importante debe implementar los 5 estados definidos en el canon:
- `loading` — mientras se cargan datos
- `empty` — sin datos que mostrar
- `error` — fallo de red o del servidor
- `offline` — sin conexión detectada
- `sync-pending` — cambios locales pendientes de sincronizar

## Integración con sync
- El estado de sync se lee desde el SDK de sync (`packages/sync-contracts`)
- La UI no gestiona la cola de sync directamente — la delega al Sync Core

## Variables de entorno relevantes
- `VITE_API_URL` — URL base de la API del backend
- `VITE_APP_NAME` — nombre visible del producto

## Consideraciones de build
- Build con Vite: genera SPA estática lista para servir desde nginx o CDN
- El PWA se configura con `vite-plugin-pwa` cuando se habilite offline
