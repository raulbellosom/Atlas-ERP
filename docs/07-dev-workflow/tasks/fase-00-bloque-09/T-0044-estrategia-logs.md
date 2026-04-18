# T-0044 - Definir estrategia de logs funcionales y tecnicos

## Metadatos
- ID: `T-0044`
- Fase: `Fase 0`
- Bloque: `Bloque 9`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir que se loggea, como se clasifica (tecnico vs funcional), que niveles se usan, cuanto se retiene y que esta absolutamente prohibido registrar en logs.

## Alcance
- Definir la distincion entre logs tecnicos y logs funcionales.
- Definir niveles de log y en que ambientes aplican.
- Definir retencion minima por tipo y ambiente.
- Definir prohibiciones absolutas en logs.
- Separar logs de auditoría formal (modulo Audit) de logs operativos.

## Fuera de alcance
- Configuracion concreta de libreria de logging por app (se delega a Fase 6 y 7).
- Integracion con agregadores externos (Loki, Datadog, etc.).
- Auditoria formal del sistema (es responsabilidad del modulo Audit, no de esta estrategia).

## Dependencias
- `T-0043` cerrada.
- Principios de seguridad y auditoria del canon (`docs/00-canon/06_security_and_audit.md`).

## Criterios de aceptacion
- [x] Distincion entre logs tecnicos y logs funcionales documentada con ejemplos.
- [x] Niveles de log definidos con ambientes de uso.
- [x] Retencion minima por tipo y ambiente documentada.
- [x] Prohibiciones absolutas documentadas.
- [x] Separacion entre logs operativos y auditoria formal explicita.
- [x] Formato recomendado de entrada de log definido.

## Validaciones
- Los logs funcionales no deben duplicar ni reemplazar la auditoria formal del modulo Audit.
- Las prohibiciones deben cubrir secretos, tokens y datos sensibles de usuarios.

## Pruebas
- Revision de codigo (en implementacion): verificar que no hay `console.log` con datos sensibles en produccion.
- Revision documental: los ejemplos de logs no contienen datos reales de usuarios.

## Riesgos
- Sin niveles bien definidos, los logs de produccion se llenan de debug y se vuelven inmanejables.
- Sin prohibiciones explicitas, es facil exponer tokens o contrasenas en logs accidentalmente.

## Documentacion a actualizar
- `docs/02-architecture/14-estrategia-logs.md`
- `docs/02-architecture/README.md`

## Decisiones clave
- Debug desactivado en produccion por defecto.
- Prohibido loggear secretos, tokens o datos personales identificables.
- Logs funcionales son operativos y rotativos; la auditoria formal es inmutable y separada.
- Formato JSON para destinos de agregacion; texto legible para consola de desarrollo.

## Evidencia documental
- `docs/02-architecture/14-estrategia-logs.md`

## Pendientes para la siguiente task
- Iniciar `T-0045` (ownership de decisiones tecnicas).

## Pendientes no resueltos
- Ninguno.
