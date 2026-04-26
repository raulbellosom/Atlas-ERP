import useAuthStore from "@/store/auth.store";

/**
 * Hook de permisos visuales.
 *
 * Retorna helpers para verificar si el usuario actual tiene un permiso
 * especifico. Los permisos se leen desde `user.permissions` (array de strings
 * en formato "recurso:accion", ej. "users:write", "audit:read").
 *
 * Mientras no haya un campo `permissions` en el token decodificado,
 * el hook trabaja con el rol del usuario como fallback simple.
 */
export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const permissions = user?.permissions ?? [];
  const normalizedRole = typeof user?.role === "string" ? user.role.toLowerCase() : null;

  /**
   * Verdadero si el usuario tiene TODOS los permisos indicados.
   * @param {...string} required
   */
  const hasAll = (...required) =>
    required.every((p) => permissions.includes(p));

  /**
   * Verdadero si el usuario tiene AL MENOS UNO de los permisos indicados.
   * @param {...string} anyOf
   */
  const hasAny = (...anyOf) => anyOf.some((p) => permissions.includes(p));

  /**
   * Verdadero si el rol del usuario es "OWNER" o "ADMIN".
   * Util como fallback cuando los permisos granulares no estén disponibles aun.
   */
  const isAdmin =
    normalizedRole === "owner" ||
    normalizedRole === "admin" ||
    user?.role === "OWNER" ||
    user?.role === "ADMIN";

  return { hasAll, hasAny, isAdmin, permissions };
}
