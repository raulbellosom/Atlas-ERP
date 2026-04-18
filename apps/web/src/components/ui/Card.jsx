/**
 * Card — Meridian v2 Design System
 *
 * Contenedor de superficie con 4 variantes de profundidad:
 *   default   — borde sutil, sin sombra (listas, tablas)
 *   elevated  — sombra card para destacar secciones
 *   glass     — glassmorphism para stats / KPI / hero
 *   tinted    — gradiente ink-50 para secciones contextuales
 *
 * Acepta accent top-border opcional con color semántico.
 *
 * @param {{
 *   variant?: 'default'|'elevated'|'glass'|'tinted',
 *   accent?: 'none'|'primary'|'success'|'error'|'warning'|'amber',
 *   interactive?: boolean,
 * } & React.HTMLAttributes} props
 */

const accentColors = {
  none:    "",
  primary: "border-t-ink-500",
  success: "border-t-success",
  error:   "border-t-error",
  warning: "border-t-warning",
  amber:   "border-t-amber-500",
};

export function Card({
  children,
  variant = "default",
  accent = "none",
  interactive = false,
  className = "",
  ...rest
}) {
  const base = "rounded-xl overflow-hidden";

  const variants = {
    default: [
      "bg-surface",
      "border border-border",
    ].join(" "),

    elevated: [
      "bg-surface",
      "border border-border",
      "[box-shadow:var(--shadow-card)]",
      interactive ? "hover:[box-shadow:var(--shadow-card-hover)] transition-shadow duration-200" : "",
    ].join(" "),

    glass: [
      "bg-[var(--color-surface-glass)]",
      "backdrop-blur-xl saturate-150",
      "border border-white/60",
      "[box-shadow:var(--shadow-md)]",
    ].join(" "),

    tinted: [
      "bg-[image:var(--gradient-card-tinted)]",
      "border border-ink-100",
    ].join(" "),
  };

  const accentClass =
    accent !== "none"
      ? `border-t-2 ${accentColors[accent] ?? accentColors.primary}`
      : "";

  return (
    <div
      className={[
        base,
        variants[variant] ?? variants.default,
        accentClass,
        interactive ? "cursor-pointer active:scale-[0.99] transition-transform duration-100" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, actions, className = "" }) {
  return (
    <div className={["flex items-start justify-between gap-3 px-5 py-4 border-b border-border", className].join(" ")}>
      <div className="min-w-0">
        {title && (
          <h3 className="text-sm font-semibold text-text-primary leading-snug">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}

export function CardBody({ children, className = "" }) {
  return (
    <div className={["px-5 py-4", className].join(" ")}>{children}</div>
  );
}

export function CardFooter({ children, className = "" }) {
  return (
    <div
      className={[
        "flex items-center justify-end gap-2",
        "px-5 py-3 border-t border-border bg-surface-subtle",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/**
 * StatCard — Tarjeta de métrica / KPI para dashboards.
 *
 * @param {{
 *   label: string,
 *   value: string|number,
 *   delta?: string,
 *   deltaType?: 'positive'|'negative'|'neutral',
 *   icon?: React.ReactNode,
 *   accent?: string,
 * }} props
 */
export function StatCard({ label, value, delta, deltaType = "neutral", icon, accent = "none", className = "" }) {
  const deltaColors = {
    positive: "text-success",
    negative: "text-error",
    neutral:  "text-text-secondary",
  };

  return (
    <Card variant="elevated" accent={accent} className={className}>
      <CardBody className="py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="label-caps text-[0.6875rem] mb-1.5">{label}</p>
            <p className="num-tabular text-2xl font-bold text-text-primary leading-none tracking-tight">
              {value}
            </p>
            {delta && (
              <p className={`mt-1.5 text-xs font-medium ${deltaColors[deltaType]}`}>
                {delta}
              </p>
            )}
          </div>
          {icon && (
            <div className="shrink-0 w-10 h-10 rounded-lg bg-ink-50 flex items-center justify-center text-ink-500">
              {icon}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
