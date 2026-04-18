# ADR 004 — Arquitectura de sincronización local/servidor

## Metadatos
- **ID**: `ADR-004`
- **Estado**: `aprobado`
- **Fecha**: `2026-04-12`
- **Task origen**: `T-0339`
- **Decisores**: SystemArchitectAgent, SyncEngineAgent, revision humana

## Contexto

El desktop de AtlasERP debe operar en modo offline (conexion intermitente en campo) y sincronizar con el servidor PostgreSQL cuando recupere conexion. Se necesita una arquitectura que:
- Permita crear/editar registros sin conexion.
- Detecte y gestione conflictos cuando varios usuarios editan el mismo registro.
- Audite cada resolucion de conflicto.
- Sea predecible y revisable por el usuario.

## Decision

**Cola local en SQLite + sincronizacion pull/push con servidor PostgreSQL.**

### Flujo offline → online

```
[Usuario crea/edita] → [SQLite local: sync_queue]
      ↓ (cuando recupera conexion)
[Desktop detecta conexion] → [Envia items de sync_queue al API]
      ↓
[API valida + aplica en PostgreSQL]
      ↓
[Conflicto? → sync_conflicts en SQLite] → [Usuario revisa en Sync Center]
[Sin conflicto? → confirma en sync_queue]
```

### Tablas SQLite locales

| Tabla               | Proposito                                         |
| ------------------- | ------------------------------------------------- |
| `sync_queue`        | Operaciones pendientes de sincronizar             |
| `sync_conflicts`    | Conflictos detectados, pendientes de resolucion   |
| `cache_snapshots`   | Copias locales de datos del servidor              |
| `local_preferences` | Preferencias de usuario (no sincronizables)       |

### Reglas de conflicto

- Conflicto: mismo registro editado localmente Y en servidor desde la ultima sync.
- Resolucion: siempre requiere intervencion humana — no hay merge automatico en datos sensibles.
- Auditoria: cada resolucion se registra en `audit_log` del servidor.

## Consecuencias

- **Positivas**: Funciona offline, datos seguros en SQLite, conflictos visibles y auditables.
- **Negativas**: Mayor complejidad en el desktop, requiere Sync Center en la UI.
- **Restriccion**: PostgreSQL es siempre la fuente de verdad — SQLite es solo auxiliar local.
- **Restriccion**: No merge automatico de conflictos en datos financieros o criticos de negocio.
