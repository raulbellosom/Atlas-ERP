# HR Core Blueprint (Refinado post-v1)

**Versión:** 2.0
**Fecha refinamiento:** 2026-04-18
**Task origen:** T-2201

---

## Propósito

Gestionar el capital humano: empleados, contratos, nómina, vacaciones y liquidaciones. Los pagos de nómina se integran con Financial Operations Core para impactar las cuentas bancarias.

---

## Entidades

| Entidad | Descripción | Sync offline |
|---------|-------------|--------------|
| `Employee` | Datos del empleado (nombre, CURP/RFC, cargo, departamento) | Sí (caché) |
| `Department` | Área organizacional | Sí (caché) |
| `Position` | Puesto/cargo | Sí (caché) |
| `Contract` | Contrato laboral: tipo, salario base, fecha inicio/fin | No |
| `PayrollRun` | Ejecución de nómina de un período: fecha + estado + totales | No |
| `PayrollEntry` | Línea de nómina por empleado: percepciones + deducciones | No |
| `LeaveRequest` | Solicitud de ausencia/vacaciones | Sí (enqueue write) |
| `LeaveBalance` | Saldo de días disponibles por empleado | Sí (caché) |
| `EmployeeDocument` | Documentos del empleado: contratos, identificaciones | No |

---

## Políticas del módulo (siguiendo patrones de v1)

### Auditoría
- Creación y modificación de `Contract`, `PayrollRun` generan `AuditLog` con `userId`, `tenantId`.
- Los pagos de nómina son irreversibles una vez ejecutados; correcciones = nuevo `PayrollRun`.

### Permisos
- `hr:read` — consulta de empleados y estructuras.
- `hr:write` — alta/baja de empleados, contratos.
- `hr:payroll` — ejecutar/confirmar nóminas.
- `hr:admin` — configurar deducciones, tablas de impuestos.

### Sync
- `Employee`, `Department`, `Position`, `LeaveBalance` se sincronizan al desktop como catálogos.
- `PayrollRun`, `Contract` son solo servidor — requieren validación en tiempo real.

### Integración con Financial Ops
- Al confirmar un `PayrollRun` → se genera automáticamente un `FinancialMovement` de egreso por el monto total neto.
- El contrato de integración está en `docs/00-canon/19_integration_contracts_hr.md`.

---

## Fases de implementación proyectadas

1. **Fase 30** — Empleados, contratos, catálogos
2. **Fase 31** — Motor de nómina + integración pago FinOps
3. **Fase 32** — Vacaciones, liquidaciones, reportes fiscales

## Estado

`futuro` — No iniciar sin blueprint técnico aprobado y Financial Ops v1 estable.
