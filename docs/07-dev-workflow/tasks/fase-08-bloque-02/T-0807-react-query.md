# T-0807 - Configurar React Query

## Metadatos
- ID: `T-0807`
- Fase: `Fase 8`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Objetivo
Integrar TanStack Query v5 como solución de server state management.

## Alcance (implementado en Bloque 1 como parte de T-0803)
- `QueryClient` configurado con `defaultOptions`: `staleTime: 30_000`, `retry: 1`.
- `QueryClientProvider` en raíz de `App.jsx`, envolviendo el router.

## Criterios de aceptacion
- [x] QueryClientProvider disponible para toda la app.
- [x] staleTime de 30s por defecto.
- [x] retry 1 vez antes de error.
- [x] lint + build OK.
