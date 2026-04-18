# T-1401 - Entidad BankAccounts: listado

## Metadatos
- ID: `T-1401`
- Fase: `Fase 14`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar la página de listado de cuentas bancarias en la interfaz web, mostrando el catálogo de cuentas de la organización con sus saldos, tipo y estatus, integrada con el API backend vía react-query.

## Alcance
- Crear página `BankAccountsPage` en `/finops/bank-accounts`.
- Tabla de cuentas con columnas: nombre, tipo, número de cuenta (mascarado), saldo, moneda, sucursal, estatus.
- Filtros de búsqueda: por nombre, tipo de cuenta, estatus (activa/inactiva).
- Botón "Nueva cuenta" que navega a la página de creación.
- Integración con `GET /api/v1/bank-accounts` vía `useQuery` de react-query.
- Estados de carga (skeleton) y error (mensaje de error con retry).

## Fuera de alcance
- Creación de cuentas (eso es T-1402).
- Edición de cuentas (eso es T-1403).
- Detalle de cuenta con movimientos (eso es T-1404).
- Paginación cursor-based (Fase 15+).

## Dependencias
- `T-1400`: layout FinOps y router disponibles.
- `T-1300`: endpoint `GET /api/v1/bank-accounts` disponible en backend.
- Componentes UI base: `DataTable`, `Badge`, `Button`, `Input` existentes en el design system.

## Criterios de aceptación
- [x] Listado de cuentas bancarias implementado.
- [x] Filtros de búsqueda funcionales.
- [x] Integración con API via react-query.
- [x] Estados de carga y error manejados.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: lista carga con datos demo correctamente.

## Pruebas
- Con datos demo: tabla muestra las cuentas del seed con saldo y tipo correctos.
- Filtrar por tipo "CORRIENTE" — tabla muestra solo cuentas de ese tipo.
- Filtrar por estatus "inactiva" — muestra solo cuentas inactivas.
- Sin red — tabla muestra error con botón de retry.

## Riesgos
- **Saldo como Decimal de Prisma**: el API puede retornar `balance` como string (Prisma Decimal → JSON). El componente debe parsear correctamente. Mitigación: usar `parseFloat()` al renderizar saldo.
- **Enums de tipo de cuenta no mapeados**: si `BankAccountType` no tiene labels legibles en el frontend, se muestran keys técnicas. Mitigación: crear diccionario `BANK_ACCOUNT_TYPE_LABELS` en el módulo.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/BankAccountsPage.jsx` — archivo nuevo.
- `apps/web/src/modules/finops/hooks/useBankAccounts.js` — hook de react-query nuevo.

## Decisiones clave
- **Enums mapeados a diccionarios del frontend**: los valores de enum del backend (ej. `CHECKING`, `SAVINGS`) se traducen a labels legibles (ej. "Cuenta corriente", "Ahorro") mediante diccionarios en el módulo frontend. Esto es la decisión técnica documentada en las Notas Técnicas originales.
- **react-query para data fetching**: el estado de la lista se maneja con `useQuery` de react-query para obtener caché, background refetch y manejo automático de estados de carga/error.

## Evidencia documental
- `apps/web/src/modules/finops/pages/BankAccountsPage.jsx`
- `apps/web/src/modules/finops/hooks/useBankAccounts.js`

## Pendientes para la siguiente task
- `T-1402` implementa el formulario de creación de cuentas.

## Pendientes no resueltos
- Ninguno.
