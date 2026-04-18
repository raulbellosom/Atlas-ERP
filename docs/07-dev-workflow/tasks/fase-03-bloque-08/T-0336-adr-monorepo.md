# T-0336 - Crear ADR inicial de estructura de monorepo

## Metadatos
- ID: `T-0336`
- Fase: `Fase 3`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `SystemArchitectAgent`

## Objetivo
Documentar formalmente la decision de arquitectura de monorepo (pnpm workspaces + Turbo) como ADR-001.

## Criterios de aceptación
- [x] `docs/09-adr/001-estructura-monorepo.md` creado con estado `aprobado`.
- [x] Contexto: necesidad de compartir codigo entre multiples apps.
- [x] Decision: monorepo con pnpm workspaces + Turbo.
- [x] Opciones consideradas: multirepo, Nx, monorepo (elegido).
- [x] Consecuencias: pros, contras y restricciones documentadas.
- [x] ADR-001 referenciado en `docs/09-adr/README.md`.

## Archivos creados
- `docs/09-adr/001-estructura-monorepo.md`

## Restricciones que establece este ADR
- Apps no pueden tener dependencias circulares entre ellas.
- Packages solo dependen de otros packages, nunca de apps.
- Todo cambio de estructura requiere actualizar este ADR o crear uno nuevo.
