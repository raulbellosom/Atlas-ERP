# Blueprint Generation Skill

## ID de task origen

- `T-0122`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Guiar la creación de blueprints de dominio consistentes y completos para módulos de AtlasERP.

## Procedimiento

### 1. Determinar tipo de blueprint

- **Blueprint de plataforma núcleo**: `core-platform.md`
- **Blueprint de módulo core transversal**: `sync-core.md`, etc.
- **Blueprint de módulo de negocio activo**: `financial-operations-core.md`, etc.
- **Blueprint de módulo futuro**: `*-future.md`

### 2. Contenido mínimo obligatorio

Todo blueprint debe incluir:

```
# [Nombre del Módulo] Blueprint

## Propósito
Descripción clara del dominio y valor de negocio del módulo.

## Alcance v1
- Qué incluye en la primera versión.

## Fuera de alcance
- Qué explícitamente no incluye.

## Entidades base
- Lista de entidades principales con descripción breve.

## Relaciones clave
- Relaciones entre entidades del módulo.
- Relaciones con entidades de Core Platform.

## Relaciones con otros módulos
- Dependencias de entrada (módulos que consume).
- Dependencias de salida (módulos que lo consumen).

## Evolución futura
- Features o entidades que se agregarán en versiones posteriores.

## Reglas de integración
- Cómo se conecta con otros módulos.
- Límites de responsabilidad.

## Política de ownership
- Quién es responsable de las entidades de este módulo.

## Política de sync
- Qué entidades se sincronizan offline.
- Qué restricciones aplican.
```

### 3. Convenciones de archivo

- Nombre de archivo en `kebab-case`.
- Ubicación: `docs/03-domain-blueprints/`.
- Sufijo `*-core.md` para módulos activos, `*-future.md` para futuros.

### 4. Validaciones

- Verificar que no contradiga el canon `docs/00-canon/*`.
- Verificar que las entidades respeten nomenclatura de `docs/04-modules/03-nomenclatura-entidades-tablas.md`.
- Verificar que el ownership esté definido.
- Actualizar `docs/03-domain-blueprints/README.md` con la nueva entrada.

## Referencia

- `docs/03-domain-blueprints/00-estructura-oficial-blueprints.md`
- `docs/04-modules/00-politica-ownership-datos.md`
