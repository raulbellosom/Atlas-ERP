# T-1024 - Implementar comparador de versiones local/server

## Metadatos
- ID: `T-1024`
- Fase: `Fase 10`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAgent`

## Alcance
`sync.service.ts` — funciones de comparacion exportadas:

- `computePayloadHash(payload)`: hash FNV-1a de 32 bits del payload serializado de forma estable (keys ordenadas). No criptografico — para detectar cambios de contenido. Retorna string hex de 8 caracteres.
- `comparePayloads(local, server) → PayloadDiff`:
  - `hasConflict: boolean` — true si los hashes difieren.
  - `localHash: string` — hash del payload local.
  - `serverHash: string` — hash del payload del servidor.
  - `changedKeys: string[]` — lista de campos que difieren (union de keys donde JSON.stringify difiere).
- Exportadas con `export function` para uso en tests unitarios futuros.

## Criterios de aceptacion
- [x] `comparePayloads` detecta diferencias de contenido correctamente.
- [x] Items con mismo contenido retornan `hasConflict=false` independientemente del orden de las keys.
- [x] typecheck + lint OK.
