# CRM Core Blueprint (Future)

## Propósito
Gestionar la relación con clientes de la organización: contactos, oportunidades, actividades de seguimiento y pipeline de ventas básico.

## Alcance futuro
Este módulo es independiente de la cadena financiera/contable/inventario. Puede construirse en paralelo a módulos posteriores si el equipo lo decide. Requiere blueprint técnico aprobado.

## Entidades futuras
- `Contact` — persona de contacto (cliente, prospecto, partner)
- `Account` — empresa o cliente (no confundir con cuenta bancaria de Financial Ops)
- `Opportunity` — oportunidad de negocio con etapa y valor estimado
- `Activity` — llamada, reunión, email, tarea relacionada a un contacto u oportunidad
- `Pipeline` — configuración del pipeline de ventas de la organización
- `PipelineStage` — etapas del pipeline

## Relaciones con otros módulos
- **Financial Operations Core**: las oportunidades ganadas pueden generar cuentas por cobrar.
- **Accounting Core**: las facturas de venta pueden tener referencia a un cliente del CRM.

## Política de sync
- Los contactos y cuentas son sincronizables como snapshot.
- Las actividades creadas offline se sincronizan con cola local.
- Los conflictos en actividades se resuelven por timestamp más reciente (política declarable en blueprint técnico).

## Requisitos previos para construirlo
- Core Platform (Auth, Organizations, Users, Roles) completado.
- Blueprint funcional y técnico de CRM Core aprobados.
- Decisión sobre integración con email/calendario documentada en ADR (si aplica).

## Estado
`futuro` — No iniciar sin blueprint técnico aprobado.
