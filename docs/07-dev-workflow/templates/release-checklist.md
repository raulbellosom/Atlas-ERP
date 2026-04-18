# Checklist de Release

## ID de task origen

- `T-0141`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Instrucciones de uso

Aplicar este checklist antes de marcar una versión como release candidata. Complementa `docs/07-dev-workflow/04-criterios-release-candidata.md`.

---

## Alcance funcional

- [ ] Todas las tasks del alcance de release están cerradas con evidencia.
- [ ] No hay tasks bloqueadas sin resolución.
- [ ] El catálogo maestro refleja el estado actual.

## Calidad

- [ ] Tests unitarios ejecutados y aprobados.
- [ ] Tests de integración ejecutados y aprobados.
- [ ] Tests E2E de flujos críticos ejecutados y aprobados.
- [ ] No hay bugs bloqueantes conocidos.
- [ ] Bugs no-bloqueantes están registrados en el backlog.

## Datos

- [ ] Migraciones Prisma validadas y aplicables.
- [ ] Seeds de datos demo funcionales.
- [ ] Compatibilidad de esquema verificada con versión anterior.
- [ ] Script de rollback de migración disponible (si aplica).

## Seguridad

- [ ] Revisión de vulnerabilidades básica ejecutada.
- [ ] Endpoints protegidos con auth/permisos.
- [ ] No hay secretos expuestos en código o logs.
- [ ] Rate limiting configurado en endpoints sensibles.

## Sync

- [ ] Flujo online → offline → online probado.
- [ ] Conflictos generan registros detectables.
- [ ] Sync Center operativo.
- [ ] Cola local sobrevive reinicios.

## Infraestructura

- [ ] Docker Compose funcional para el ambiente destino.
- [ ] Healthchecks configurados y respondiendo.
- [ ] Variables de entorno documentadas y validadas.
- [ ] Pipeline de deploy funcional.

## Observabilidad

- [ ] Logs estructurados funcionando.
- [ ] Health endpoint disponible.
- [ ] Trazabilidad de errores mínima.

## Documentación

- [ ] Documentación técnica actualizada.
- [ ] Guía de desarrollo local actualizada.
- [ ] Changelog actualizado.
- [ ] Plan de rollback documentado.

## Desktop (si aplica)

- [ ] Build desktop funcional.
- [ ] Arranque autenticado y offline probado.
- [ ] Cola local y sync desktop probados.

## Aprobación

- [ ] Revisión humana final completada.
- [ ] UAT interno aprobado (si aplica).
- [ ] Release candidate aprobada para deploy.

## Referencia

- `docs/07-dev-workflow/04-criterios-release-candidata.md`
