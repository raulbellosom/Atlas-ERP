/**
 * Contrato offline del módulo FinOps.
 *
 * Define qué entidades y operaciones pueden ejecutarse sin conexión
 * en la aplicación desktop. Este archivo es la fuente de verdad del
 * comportamiento offline del módulo.
 *
 * Referencia: docs/02-architecture/15-offline-contract-finops.md
 * Task origen: T-1500 / T-1501 (Fase 15 Bloque 1)
 */

/**
 * Operaciones permitidas en modo offline (se encolan para sync posterior).
 */
export const FINOPS_OFFLINE_ALLOWED_OPS = Object.freeze([
  "financial_movement.create",
  "financial_transfer.create",
  "receivable.create",
  "payable.create",
  "attachment.create",
]);

/**
 * Operaciones bloqueadas en modo offline con su razón y modo de UX.
 * mode: 'hide' → el botón/acción no se renderiza.
 * mode: 'disable' → el botón se muestra deshabilitado con tooltip.
 */
export const FINOPS_OFFLINE_BLOCKED_OPS = Object.freeze([
  { op: "bank_account.create",     mode: "hide",    reason: "Requiere validación de unicidad en el servidor." },
  { op: "bank_account.update",     mode: "hide",    reason: "Riesgo de conflicto con estado del servidor." },
  { op: "bank_account.delete",     mode: "hide",    reason: "Riesgo de inconsistencia." },
  { op: "financial_movement.update", mode: "hide",  reason: "Riesgo de conflicto con estado del servidor." },
  { op: "financial_movement.delete", mode: "hide",  reason: "Riesgo de inconsistencia." },
  { op: "financial_transfer.update", mode: "hide",  reason: "Riesgo de conflicto con estado del servidor." },
  { op: "financial_transfer.delete", mode: "hide",  reason: "Riesgo de inconsistencia." },
  { op: "financial_transfer.approve", mode: "disable", reason: "La aprobación requiere conexión." },
  { op: "financial_transfer.reject",  mode: "disable", reason: "El rechazo requiere conexión." },
  { op: "receivable.update",       mode: "hide",    reason: "Riesgo de conflicto con estado del servidor." },
  { op: "receivable.delete",       mode: "hide",    reason: "Riesgo de inconsistencia." },
  { op: "payable.update",          mode: "hide",    reason: "Riesgo de conflicto con estado del servidor." },
  { op: "payable.delete",          mode: "hide",    reason: "Riesgo de inconsistencia." },
  { op: "reconciliation.*",        mode: "hide",    reason: "Requiere comparar partidas del servidor en tiempo real." },
  { op: "balance_snapshot.create", mode: "disable", reason: "El corte de saldo requiere conexión." },
]);

/**
 * TTLs de refresco de caché por entidad (en milisegundos).
 */
export const FINOPS_CACHE_TTL_MS = Object.freeze({
  bank_accounts:   60 * 60 * 1000,       // 1 hora
  movements:       60 * 60 * 1000,        // 1 hora
  transfers:       60 * 60 * 1000,        // 1 hora
  receivables:     60 * 60 * 1000,        // 1 hora
  payables:        60 * 60 * 1000,        // 1 hora
  balance_summary: 30 * 60 * 1000,        // 30 minutos
});

/**
 * Ventana de datos del caché de movimientos (en días).
 */
export const FINOPS_MOVEMENTS_CACHE_DAYS = 90;

/**
 * Devuelve si una operación está permitida en modo offline.
 * @param {string} entity
 * @param {string} operation
 * @returns {boolean}
 */
export function isAllowedOffline(entity, operation) {
  return FINOPS_OFFLINE_ALLOWED_OPS.includes(`${entity}.${operation}`);
}

/**
 * Devuelve la regla de bloqueo para una operación, o null si está permitida.
 * @param {string} entity
 * @param {string} operation
 * @returns {{ op: string, mode: string, reason: string } | null}
 */
export function getBlockedOpRule(entity, operation) {
  const key = `${entity}.${operation}`;
  return (
    FINOPS_OFFLINE_BLOCKED_OPS.find(
      (rule) => rule.op === key || rule.op === `${entity}.*`,
    ) ?? null
  );
}
