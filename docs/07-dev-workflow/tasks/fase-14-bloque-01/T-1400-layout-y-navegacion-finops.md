# T-1400 - Layout y navegación FinOps

## Metadatos
- ID: `T-1400`
- Fase: `Fase 14`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar el layout de sección y la navegación lateral del módulo Financial Operations Core en la aplicación web React, estableciendo la estructura de rutas y subrutas del módulo que serán usadas por todos los componentes de Fase 14.

## Alcance
- Crear layout raíz del módulo `FinOps` con `Outlet` de React Router.
- Registrar subrutas del módulo en el router principal:
  - `/finops/bank-accounts`
  - `/finops/movements`
  - `/finops/transfers`
  - `/finops/reconciliation`
  - `/finops/balance`
  - `/finops/receivables`
  - `/finops/payables`
- Agregar ítem de navegación `Financial Operations` en el `Sidebar` con submenú colapsable.
- Proteger rutas con verificación de permiso `finops:*:read`.

## Fuera de alcance
- Implementación de las páginas individuales (eso es T-1401+).
- Dashboard resumen de FinOps (Fase 15+).
- Permisos granulares por subruta (Fase 15+).

## Dependencias
- `T-1332`: permisos `finops:*:read` definidos en el backend.
- Sistema de navegación (`Sidebar.jsx`) y router existentes.
- React Router v6 configurado en `apps/web`.

## Criterios de aceptación
- [x] Layout FinOps creado con Outlet.
- [x] Subrutas registradas en el router.
- [x] Ítem de navegación en sidebar funcional.
- [x] Rutas protegidas por permiso.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual UI: navegación entre subrutas funciona correctamente.

## Pruebas
- Navegar a `/finops/bank-accounts` — renderiza el layout sin error.
- Navegar a `/finops/movements` — renderiza el layout.
- Clic en ítem `Financial Operations` en sidebar — expande submenú.
- Sin permiso `finops:read` — redirige a pantalla de acceso denegado o dashboard.

## Riesgos
- **Conflicto de rutas con módulos existentes**: si el router ya tiene una ruta `/finops`, se genera conflicto. Mitigación: verificar rutas existentes antes de registrar.
- **Submenú de sidebar no colapsable**: si el sidebar no soporta subitems, requiere refactorización. Mitigación: verificar capacidad del `Sidebar.jsx` antes de implementar.

## Documentación a actualizar
- `apps/web/src/router.tsx` (o equivalente) — subrutas FinOps registradas.
- `apps/web/src/components/layout/Sidebar.jsx` — ítem FinOps agregado.
- `apps/web/src/modules/finops/layout/FinOpsLayout.jsx` — archivo nuevo.

## Decisiones clave
- **Layout raíz con Outlet**: el patrón de layout raíz + Outlet es el estándar de React Router v6 para módulos con subrutas. Permite que cada página del módulo se renderice dentro del mismo contenedor.
- **Submenú colapsable en sidebar**: el módulo FinOps tiene 7 entidades, por lo que un submenú colapsable es necesario para no saturar la navegación principal.

## Evidencia documental
- `apps/web/src/modules/finops/layout/FinOpsLayout.jsx`
- `apps/web/src/router.tsx` (rutas FinOps)
- `apps/web/src/components/layout/Sidebar.jsx` (ítem FinOps)

## Pendientes para la siguiente task
- `T-1401` implementa el listado de cuentas bancarias.

## Pendientes no resueltos
- Ninguno.
