# T-0322 - Configurar scripts para release notes

## Metadatos
- ID: `T-0322`
- Fase: `Fase 3`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Configurar el sistema de release notes y versionado del monorepo usando Changesets + conventional-changelog, con scripts listos para generar CHANGELOG.md.

## Criterios de aceptación
- [x] `@changesets/cli` añadido a devDependencies raíz.
- [x] `.changeset/config.json` creado con configuración base para monorepo privado.
- [x] `conventional-changelog-cli` añadido a devDependencies raíz.
- [x] Scripts en `package.json` raíz:
  - `changeset` — abre el wizard para registrar un cambio.
  - `version-packages` — aplica changesets y actualiza versiones.
  - `release:notes` — genera/actualiza CHANGELOG.md desde commits convencionales.

## Archivos creados/modificados
- `.changeset/config.json`
- `package.json` (raíz) — scripts changeset, version-packages, release:notes + devDependencies

## Flujo de trabajo con Changesets

```
1. Developer hace cambio + commit
2. pnpm changeset           → registra el cambio (patch/minor/major)
3. pnpm version-packages    → actualiza package.json versions
4. pnpm release:notes       → actualiza CHANGELOG.md
5. git commit + tag + push  → CI/CD publica si aplica
```

## Decisiones técnicas
- **Changesets para monorepo**: Permite versionar packages independientemente (`@atlasrep/ui` v1.2 vs `@atlasrep/shared` v1.0).
- **`access: "restricted"`**: Los packages son privados — no se publican a npm público.
- **`baseBranch: "main"`**: Changesets compara contra `main` para calcular qué cambió.
- **conventional-changelog como complemento**: Para CHANGELOG.md automático desde los mensajes de commit.

## Pendientes no resueltos
- Ninguno. El primer changeset real se registra cuando el proyecto tenga código publicable.
