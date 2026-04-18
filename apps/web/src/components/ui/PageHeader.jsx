/**
 * PageHeader — Meridian v2 Design System
 *
 * Encabezado de página con tipografía de alto impacto.
 * Título en Plus Jakarta Sans 800 con gradiente ink→amber opcionalSoporta: breadcrumb, descripción, acciones, y un tag/badge de estado.
 *
 * @param {{
 *   title: string,
 *   description?: string,
 *   actions?: React.ReactNode,
 *   breadcrumb?: React.ReactNode,
 *   tag?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  tag,
  className = "",
}) {
  return (
    <div
      className={[
        "flex flex-col gap-3",
        "sm:flex-row sm:items-start sm:justify-between",
        className,
      ].join(" ")}
    >
      {/* Bloque izquierdo */}
      <div className="flex items-stretch gap-4 min-w-0">
        {/* Acento amber — marcador de territorio más grueso y visible */}
        <div
          className="w-1 shrink-0 rounded-full self-stretch"
          style={{
            background: "linear-gradient(180deg, oklch(78% 0.180 65), oklch(55% 0.148 245))",
          }}
          aria-hidden="true"
        />

        <div className="min-w-0">
          {breadcrumb && (
            <div className="mb-2 -mt-0.5">{breadcrumb}</div>
          )}

          <div className="flex items-center gap-2.5 flex-wrap">
            <h1
              className="text-text-primary leading-tight truncate"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
                letterSpacing: "-0.025em",
                lineHeight: 1.15,
              }}
            >
              {title}
            </h1>
            {tag && <div className="shrink-0">{tag}</div>}
          </div>

          {description && (
            <p className="text-sm text-text-secondary mt-1.5 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Acciones — se pegan a la derecha en desktop, abajo en mobile */}
      {actions && (
        <div className="flex items-center gap-2 sm:mt-1 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}
