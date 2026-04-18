# T-0335 - Configurar gestor de cambios de versiones internas

## Metadatos
- ID: `T-0335`
- Fase: `Fase 3`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Establecer el sistema de gestion de versiones internas del monorepo: Changesets para versionado semántico de packages y conventional-changelog para generacion de CHANGELOG.md.

## Criterios de aceptación
- [x] `@changesets/cli` configurado en T-0322 — `.changeset/config.json` existente.
- [x] `conventional-changelog-cli` en devDependencies raíz (T-0322).
- [x] Scripts en raíz: `changeset`, `version-packages`, `release:notes`.
- [x] `baseBranch: "main"` configurado en Changesets.
- [x] `access: "restricted"` — packages privados, no publicables en npm.

## Verificacion de estado
- `.changeset/config.json` — existente ✓
- Scripts en package.json raíz — existentes ✓
- devDependencies — existentes ✓

## Flujo de trabajo completo

```bash
# 1. Desarrollador hace cambio
git add . && git commit -m "feat(ui): add Button component"

# 2. Registrar el changeset
pnpm changeset
# → Selector interactivo: patch | minor | major por package

# 3. En merge a main — aplicar versiones
pnpm version-packages
# → Actualiza package.json versions + genera CHANGELOG.md por package

# 4. Generar release notes desde commits
pnpm release:notes
# → Genera/actualiza CHANGELOG.md raiz desde commits convencionales
```

## Decisiones tecnicas
- **Changesets vs semantic-release**: Changesets es mas adecuado para monorepos con packages independientes.
- **No publicar a npm**: Los packages son `private: true` — solo uso interno entre apps.
- **Conventional commits + Commitlint**: Garantiza que los mensajes de commit sean parseables por conventional-changelog.

## Pendientes no resueltos
- Ninguno. El primer changeset real se crea cuando se publique codigo en un package.
