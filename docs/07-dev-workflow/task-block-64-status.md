# Task Block 64 — Fase 8, Bloque 2

## Estado: COMPLETADO

| Task | Título | Estado |
|------|--------|--------|
| T-0805 | Configurar layout shell público/privado | closed |
| T-0806 | Configurar cliente HTTP/API | closed |
| T-0807 | Configurar React Query | closed |
| T-0808 | Configurar estado global mínimo | closed |
| T-0809 | Configurar manejo de sesión | closed |

## Validaciones
- lint: OK
- build: OK (154 módulos, 308.69 kB main, 1.25s)

## Archivos modificados
- `apps/web/src/store/auth.store.js` — refreshToken en estado y persist
- `apps/web/src/api/client.js` — interceptor 401 → refresh → retry + cola de requests

## Notas
- T-0805, T-0806, T-0807, T-0808 implementados en Bloque 1; documentados en Bloque 2.
- T-0809 es la única implementación nueva de este bloque.
