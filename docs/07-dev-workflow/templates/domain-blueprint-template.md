# Plantilla Estándar para Blueprints de Dominio

## ID de task origen

- `T-0136`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Instrucciones de uso

Copiar esta plantilla y completar para cada nuevo módulo de dominio. Guardar en `docs/03-domain-blueprints/` con nombre en `kebab-case`.

---

# [Nombre del Módulo] Blueprint

## Metadatos

- Tipo: `plataforma-nucleo | core-transversal | negocio-activo | futuro`
- Fase del backlog: `F-XX`
- Estado: `borrador | aprobado | en-implementacion | completo`
- Owner: `nombre del responsable`
- Fecha: `YYYY-MM-DD`

## Propósito

Descripción clara del dominio, valor de negocio y razón de existir del módulo.

## Alcance v1

- Capacidad incluida 1
- Capacidad incluida 2
- Capacidad incluida 3

## Fuera de alcance

- Capacidad excluida 1
- Capacidad excluida 2

## Entidades base

| Entidad | Descripción       | Ownership    |
| ------- | ----------------- | ------------ |
| Ejemplo | Descripción breve | módulo-owner |

## Relaciones clave

- Entidad A tiene muchos Entidad B.
- Entidad B pertenece a Organization.
- Entidad C referencia a User como actor.

## Relaciones con Core Platform

- Dependencia de Organization (multi-tenant).
- Dependencia de User (actores).
- Dependencia de Role/Permission (autorización).
- Dependencia de AuditLog (auditoría).
- Dependencia de Attachment (adjuntos) si aplica.

## Relaciones con otros módulos

| Módulo   | Tipo de relación | Descripción                  |
| -------- | ---------------- | ---------------------------- |
| Módulo X | consume          | Este módulo lee datos de X   |
| Módulo Y | provee           | Este módulo provee datos a Y |

## Evolución futura

- Feature futura 1 (horizonte estimado).
- Feature futura 2 (horizonte estimado).

## Reglas de integración

- Cómo se conecta con otros módulos.
- Límites de responsabilidad claros.
- Contratos de API que expone o consume.

## Política de ownership

- Entidades de este módulo son propiedad de: [owner].
- Otros módulos no modifican estas entidades sin contrato explícito.

## Política de sync

| Entidad | Crear offline | Editar offline | Eliminar offline | Conflictos posibles | Revisión manual |
| ------- | ------------- | -------------- | ---------------- | ------------------- | --------------- |
| Ejemplo | sí/no         | sí/no/parcial  | sí/no            | tipo                | sí/no           |

## Política de auditoría

- Acciones auditadas: crear, editar, eliminar, [acciones especiales].
- Campos sensibles que requieren log de before/after: [lista].

## Permisos del módulo

| Permiso         | Descripción |
| --------------- | ----------- |
| `modulo.list`   | Ver listado |
| `modulo.read`   | Ver detalle |
| `modulo.create` | Crear       |
| `modulo.update` | Editar      |
| `modulo.delete` | Eliminar    |
