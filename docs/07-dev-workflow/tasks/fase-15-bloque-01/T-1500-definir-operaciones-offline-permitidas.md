# T-1500 - Definir qué operaciones del módulo se permiten offline

## Metadatos
- ID: `T-1500`
- Fase: `Fase 15`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Definir y documentar el contrato de operaciones permitidas en modo offline para el módulo FinOps en la aplicación desktop Tauri, estableciendo el límite claro de qué puede hacer el usuario sin conexión y qué queda encolado para sincronizar al reconectar.

## Alcance
- Analizar cada entidad y sus operaciones respecto a compatibilidad offline:

| Entidad | Leer caché | Crear (encolado) | Editar | Eliminar |
|---------|-----------|-----------------|--------|---------|
| BankAccounts | ✅ | ❌ | ❌ | ❌ |
| FinancialMovements | ✅ (últimos 90 días) | ✅ | ❌ | ❌ |
| Transfers | ✅ | ✅ | ❌ | ❌ |
| ReceivablesLite | ✅ | ✅ | ❌ | ❌ |
| PayablesLite | ✅ | ✅ | ❌ | ❌ |
| ReconciliationSessions | ❌ | ❌ | ❌ | ❌ |
| BalanceSnapshots | ✅ (último conocido) | ❌ | ❌ | ❌ |

- Producir el documento `docs/15-offline-contract-finops.md` en `docs/02-architecture/` con la tabla anterior y su justificación técnica.
- Registrar las operaciones permitidas como constante `FINOPS_OFFLINE_ALLOWED_OPS` en el código desktop.

## Fuera de alcance
- Implementación de repositorios SQLite (T-1502).
- Implementación de la cola de sync (T-1507 a T-1509).
- Definición de operaciones NO permitidas en detalle (T-1501).

## Dependencias
- `T-1426`: Fase 14 completa — todas las entidades FinOps web implementadas.
- `T-0913` a `T-0914`: Sync Core queue implementado — se reutiliza el patrón de enqueue.
- `T-1033`: Contratos de sync del Sync Core definidos.

## Criterios de aceptación
- [x] Documento `docs/02-architecture/15-offline-contract-finops.md` creado con tabla completa y justificaciones.
- [x] Constante `FINOPS_OFFLINE_ALLOWED_OPS` definida en `apps/desktop/src/modules/finops/offline-contract.js`.
- [x] Revisión aprobada por el equipo (no hay código ejecutable — es una decisión de diseño).

## Validaciones
- Revisión manual: el documento responde claramente a "¿puede el usuario hacer X sin conexión?" para cada operación.
- `pnpm --filter @atlasrep/desktop run typecheck`: constante tipada sin errores.

## Pruebas
- No aplica prueba automatizada — es un documento de decisión.
- Revisión con checklist: cada entidad y operación tiene una decisión explícita con justificación.

## Riesgos
- **Ambigüedad en ediciones parciales**: una edición de metadatos de un movimiento (ej. corregir descripción) podría justificarse en offline. Decisión inicial conservadora: no permitir ediciones en v1 offline para evitar conflictos de merge.

## Documentación a actualizar
- `docs/02-architecture/15-offline-contract-finops.md` — archivo nuevo.
- `apps/desktop/src/modules/finops/offline-contract.ts` — constante de contrato.

## Decisiones clave
- **Crear sí, editar no en offline**: la creación de registros (movimientos, CxC, CxP, transferencias) es el caso de uso más frecuente en campo y es segura de encolar. Las ediciones requieren conocer el estado actual del servidor y pueden generar conflictos — se bloquean en v1.
- **BankAccounts solo lectura**: crear cuentas bancarias es una operación administrativa poco frecuente que no justifica el riesgo de conflicto. Solo se leen desde caché.

## Evidencia documental
- `docs/02-architecture/15-offline-contract-finops.md`
- `apps/desktop/src/modules/finops/offline-contract.ts`

## Pendientes para la siguiente task
- `T-1501` completa el contrato definiendo en detalle las operaciones NO permitidas y su UX de bloqueo.

## Pendientes no resueltos
- Ninguno.
