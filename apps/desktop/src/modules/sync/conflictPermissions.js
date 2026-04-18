const ALLOWED_ROLES = new Set(["admin", "owner", "superadmin"]);
const RESOLUTION_PERMISSION_KEYS = new Set([
  "sync.conflicts.resolve",
  "sync:conflicts:resolve",
  "sync:resolve",
  "admin:full",
]);

function normalizeList(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) => (typeof entry === "string" ? entry.trim().toLowerCase() : ""))
    .filter(Boolean);
}

export function canResolveSyncConflicts(session) {
  const user = session?.user;
  if (!user) {
    return false;
  }

  const role = typeof user.role === "string" ? user.role.trim().toLowerCase() : "";
  if (ALLOWED_ROLES.has(role)) {
    return true;
  }

  const declaredPermissions = [
    ...normalizeList(user.permissions),
    ...normalizeList(user.scopes),
  ];

  return declaredPermissions.some((permission) =>
    RESOLUTION_PERMISSION_KEYS.has(permission),
  );
}

export function getSyncConflictPermissionMessage(session) {
  if (!session?.user) {
    return "Inicia sesión para resolver conflictos.";
  }

  if (canResolveSyncConflicts(session)) {
    return "";
  }

  return "Tu usuario no tiene permiso para resolver conflictos de sincronización.";
}

