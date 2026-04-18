# Mapa de Relaciones entre Módulos

## Propósito
Visualizar cómo se relacionan los módulos del sistema entre sí, qué depende de qué y cuál es el orden de construcción recomendado.

## Diagrama de dependencias (textual)

```
Core Platform (Auth, Users, Roles, Organizations, Audit, Attachments, Settings, Feature Flags)
    │
    ├──► Sync Core (depende de Core Platform para auth y audit)
    │
    ├──► Financial Operations Core (depende de Core Platform y Sync Core)
    │       │
    │       ├──► Accounting Core (depende de Financial Ops)
    │       │
    │       └──► Purchases Core (depende de Financial Ops)
    │               │
    │               └──► Inventory Core (depende de Purchases Core)
    │
    ├──► CRM Core (depende de Core Platform; puede integrarse con Financial Ops)
    │
    └──► Notifications Core (depende de Core Platform; se integra con cualquier módulo)
         └──► HR Core (depende de Core Platform; futuro)
```

## Tabla de dependencias por módulo

| Módulo | Depende de | Bloqueado hasta que |
|--------|-----------|---------------------|
| Core Platform | — | Puede iniciar primero |
| Sync Core | Core Platform | Core Platform operativo |
| Financial Ops Core | Core Platform + Sync Core | Ambos operativos |
| Accounting Core | Financial Ops Core | Financial Ops estable |
| Purchases Core | Financial Ops Core | Financial Ops estable |
| Inventory Core | Purchases Core | Purchases Core operativo |
| CRM Core | Core Platform | Core Platform operativo |
| HR Core | Core Platform | Core Platform operativo |
| Notifications Core | Core Platform | Al menos un módulo de negocio activo |

## Flujo de datos entre módulos

### Financial Ops → Accounting
- Un movimiento financiero aprobado puede generar un asiento contable.
- La integración es unidireccional: Financial Ops escribe; Accounting Core lee y procesa.

### Purchases Core → Financial Ops
- Una factura de proveedor pagada genera un movimiento de egreso en Financial Ops.

### Purchases Core → Inventory Core
- Una recepción de mercancía genera un movimiento de entrada en Inventory Core.

### Cualquier módulo → Notifications Core
- Los módulos emiten eventos; Notifications Core los escucha y genera notificaciones.
- La integración es via eventos del sistema (event bus interno de NestJS o similar).

## Regla de dependencias
Ningún módulo puede depender de uno posterior en el orden de construcción. Si `Financial Ops` necesita datos de `Accounting`, los consume via API, no via dependencia directa de módulo.
