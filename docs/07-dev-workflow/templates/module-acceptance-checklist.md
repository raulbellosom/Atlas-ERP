# Checklist de Aceptación por Módulo

## ID de task origen

- `T-0140`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Instrucciones de uso

Aplicar este checklist antes de declarar un módulo como terminado. Complementa `docs/07-dev-workflow/03-criterios-modulo-terminado.md`.

---

## Dominio y blueprint

- [ ] Blueprint funcional aprobado y actualizado.
- [ ] Ownership del dominio definido.
- [ ] Entidades, relaciones y reglas de negocio validadas.
- [ ] Evolución futura documentada.

## Backend

- [ ] Módulo NestJS creado con estructura oficial.
- [ ] Controladores implementados con endpoints documentados.
- [ ] Servicios con lógica de negocio completa para alcance v1.
- [ ] DTOs con validaciones apropiadas.
- [ ] Paginación y filtros funcionando.
- [ ] Guards de auth y permisos en todos los endpoints.
- [ ] Auditoría en operaciones críticas.
- [ ] Tests unitarios de servicios.
- [ ] Tests de integración de endpoints.

## Frontend

- [ ] Rutas del módulo registradas en router.
- [ ] Páginas principales implementadas (list, detail, create, edit).
- [ ] Estados UX cubiertos: loading, empty, error, offline, sync pending.
- [ ] Formularios con validaciones frontend.
- [ ] Tablas con paginación, filtros y ordenamiento.
- [ ] Permisos visuales por acción.
- [ ] Responsive en breakpoints principales.
- [ ] Integración con API funcionando.

## Datos

- [ ] Modelos Prisma creados y migración generada.
- [ ] Seeds de datos demo.
- [ ] Índices apropiados.
- [ ] Soft delete donde aplique.

## Sync

- [ ] Política de sync declarada por entidad.
- [ ] Integración con cola local (si aplica desktop).
- [ ] Resolución de conflictos implementada donde corresponda.

## Seguridad

- [ ] Permisos granulares definidos.
- [ ] Scoping por organización validado.
- [ ] Auditoría verificada.
- [ ] No hay vulnerabilidades evidentes.

## Documentación

- [ ] Blueprint actualizado.
- [ ] README del módulo creado/actualizado.
- [ ] Tasks de implementación cerradas con evidencia.
- [ ] Catálogo maestro actualizado.

## Referencia

- `docs/07-dev-workflow/03-criterios-modulo-terminado.md`
