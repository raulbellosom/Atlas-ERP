# T-1404 - Entidad BankAccounts: detalle

## Metadatos
- ID: `T-1404`
- Fase: `Fase 14`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar la vista de detalle de una cuenta bancaria, mostrando su información completa, saldo actual, últimos movimientos y accesos rápidos a operaciones frecuentes.

## Alcance
- Crear página `BankAccountDetailPage` en `/finops/bank-accounts/:id`.
- Secciones de la página:
  - Encabezado: nombre, tipo, número (mascarado), estatus, saldo actual.
  - Resumen de saldo: balance actual, moneda, última actualización.
  - Lista de últimos 5 movimientos vinculados (con link a listado completo filtrado).
  - Acciones: "Editar", "Registrar movimiento", "Nueva transferencia".
- Integración con:
  - `GET /api/v1/bank-accounts/:id` — datos de la cuenta.
  - `GET /api/v1/bank-accounts/:id/balance` — saldo actual.
  - `GET /api/v1/financial-movements/by-filters?bankAccountId=:id&limit=5` — últimos movimientos.

## Fuera de alcance
- Gráfico de evolución de saldo histórico (Fase 15+).
- Balance snapshot histórico desde esta vista (accesible desde BalanceSnapshots).
- Lista completa de movimientos (accesible desde `/finops/movements` con filtro de cuenta).

## Dependencias
- `T-1401`, `T-1402`, `T-1403`: flujo de listado y edición disponibles.
- `T-1325`: endpoint de balance por cuenta disponible.
- `T-1326`: endpoint de movimientos por filtros disponible.

## Criterios de aceptación
- [x] Vista de detalle con saldo actual.
- [x] Últimos 5 movimientos vinculados.
- [x] Acciones de navegación hacia edición y operaciones.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: detalle de cuenta demo carga correctamente.

## Pruebas
- Navegar a detalle de cuenta existente — todos los datos se muestran.
- Clic en "Ver todos los movimientos" — navega a `/finops/movements?bankAccountId=:id`.
- Clic en "Editar" — navega a formulario de edición.
- Cuenta inexistente — muestra pantalla de error 404.

## Riesgos
- **Múltiples queries paralelas**: la página hace 3 queries al cargar (cuenta, balance, movimientos). Si alguna falla, el estado de error debe manejarse por sección. Mitigación: usar `useQuery` independiente por sección con skeleton por sección.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/BankAccountDetailPage.jsx` — archivo nuevo.

## Decisiones clave
- **Balance desde endpoint dedicado**: el saldo se obtiene de `/bank-accounts/:id/balance` en lugar del campo `balance` del objeto cuenta. Esto garantiza que siempre se muestra el valor más actualizado.
- **Últimos 5 movimientos como preview**: la vista de detalle no es una lista completa — es un resumen. El acceso a la lista completa es desde la sección de movimientos con filtro de cuenta.

## Evidencia documental
- `apps/web/src/modules/finops/pages/BankAccountDetailPage.jsx`

## Pendientes para la siguiente task
- `T-1405` (Bloque 2) implementa el listado completo de movimientos financieros.

## Pendientes no resueltos
- Ninguno.
