import { usePermissions } from "@/hooks/usePermissions";

/**
 * Wrapper declarativo de permisos visuales.
 *
 * Renderiza `children` solo si el usuario cumple el criterio de permisos.
 * Si no cumple, renderiza `fallback` (null por defecto — elemento invisible).
 *
 * Uso:
 *   <PermissionGate require="users:write">
 *     <Button>Crear usuario</Button>
 *   </PermissionGate>
 *
 *   <PermissionGate anyOf={["audit:read", "admin:full"]} fallback={<p>Acceso denegado</p>}>
 *     <AuditTable />
 *   </PermissionGate>
 *
 *   <PermissionGate adminOnly>
 *     <DangerZone />
 *   </PermissionGate>
 */
export default function PermissionGate({
  require,
  anyOf,
  adminOnly,
  fallback = null,
  children,
}) {
  const { hasAll, hasAny, isAdmin } = usePermissions();

  let allowed = true;

  if (adminOnly) {
    allowed = isAdmin;
  } else if (anyOf) {
    allowed = hasAny(...(Array.isArray(anyOf) ? anyOf : [anyOf]));
  } else if (require) {
    allowed = hasAll(...(Array.isArray(require) ? require : [require]));
  }

  return allowed ? children : fallback;
}
