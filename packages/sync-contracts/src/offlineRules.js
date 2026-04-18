const OFFLINE_ENTITY_RULES = Object.freeze({
  organization: Object.freeze({
    allowOffline: false,
    operations: Object.freeze([]),
    reason: "Entidad de gobierno global, solo editable en línea.",
  }),
  branch: Object.freeze({
    allowOffline: false,
    operations: Object.freeze([]),
    reason: "Configuración de sucursal requiere validación en servidor.",
  }),
  user: Object.freeze({
    allowOffline: false,
    operations: Object.freeze([]),
    reason: "Identidad y acceso se controlan en servidor.",
  }),
  role: Object.freeze({
    allowOffline: false,
    operations: Object.freeze([]),
    reason: "Roles y permisos no se gestionan offline.",
  }),
  permission: Object.freeze({
    allowOffline: false,
    operations: Object.freeze([]),
    reason: "Permisos se gestionan únicamente en servidor.",
  }),
  user_role: Object.freeze({
    allowOffline: false,
    operations: Object.freeze([]),
    reason: "Asignaciones RBAC requieren auditoría en línea.",
  }),
  role_permission: Object.freeze({
    allowOffline: false,
    operations: Object.freeze([]),
    reason: "Asignaciones RBAC requieren auditoría en línea.",
  }),
  setting: Object.freeze({
    allowOffline: true,
    operations: Object.freeze(["create", "update", "upsert"]),
    reason: "Cambios de configuración local son sincronizables y de bajo riesgo.",
  }),
  feature_flag: Object.freeze({
    allowOffline: true,
    operations: Object.freeze(["create", "update", "upsert"]),
    reason: "Flags locales pueden encolarse y validar en servidor.",
  }),
  attachment: Object.freeze({
    allowOffline: true,
    operations: Object.freeze(["create", "update"]),
    reason: "Adjuntos permiten captura offline, publicación sujeta a validación posterior.",
  }),
  device_registry: Object.freeze({
    allowOffline: true,
    operations: Object.freeze(["create", "update", "upsert"]),
    reason: "Estado de dispositivo puede persistirse localmente.",
  }),
  financial_account: Object.freeze({
    allowOffline: false,
    operations: Object.freeze([]),
    reason: "Catálogo financiero requiere confirmación en línea.",
  }),
  financial_movement: Object.freeze({
    allowOffline: true,
    operations: Object.freeze(["create", "update"]),
    reason: "Movimientos se permiten offline con resolución de conflictos obligatoria.",
  }),
  financial_transfer: Object.freeze({
    allowOffline: true,
    operations: Object.freeze(["create"]),
    reason: "Transferencias pueden capturarse offline, cierre sujeto a validación de servidor.",
  }),
});

/**
 * @param {unknown} entity
 * @returns {object | null}
 */
function getOfflineRuleForEntity(entity) {
  if (typeof entity !== "string") {
    return null;
  }

  return OFFLINE_ENTITY_RULES[entity] ?? null;
}

/**
 * @param {string} entity
 * @param {string} operation
 * @returns {{ allowed: boolean, reason: string, rule: object | null }}
 */
function canOperateOffline(entity, operation) {
  const rule = getOfflineRuleForEntity(entity);
  if (!rule) {
    return {
      allowed: false,
      reason: `Entidad '${entity}' no tiene regla offline registrada.`,
      rule: null,
    };
  }

  if (!rule.allowOffline) {
    return {
      allowed: false,
      reason: rule.reason,
      rule,
    };
  }

  const allowedOperation =
    typeof operation === "string" && rule.operations.includes(operation);

  if (!allowedOperation) {
    return {
      allowed: false,
      reason: `Operación '${operation}' no permitida offline para '${entity}'.`,
      rule,
    };
  }

  return {
    allowed: true,
    reason: rule.reason,
    rule,
  };
}

module.exports = {
  OFFLINE_ENTITY_RULES,
  canOperateOffline,
  getOfflineRuleForEntity,
};
