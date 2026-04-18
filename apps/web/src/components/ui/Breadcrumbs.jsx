import { Link } from "react-router-dom";

/**
 * Breadcrumbs de navegacion.
 *
 * Uso:
 *   <Breadcrumbs
 *     items={[
 *       { label: "Dashboard", to: "/dashboard" },
 *       { label: "Usuarios", to: "/users" },
 *       { label: "Detalle" },           // sin `to` → item actual (no enlace)
 *     ]}
 *   />
 */
export default function Breadcrumbs({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Ruta de navegacion" className="flex items-center gap-1 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && (
              <span className="text-text-disabled select-none" aria-hidden="true">
                /
              </span>
            )}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? "font-medium text-text-primary" : "text-text-secondary"}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
