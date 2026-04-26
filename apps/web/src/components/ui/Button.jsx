/**
 * Button — Meridian v2 Design System
 *
 * Botones de acción principal del ERP con 5 variantes de intención + 4 tamaños.
 * Touch targets mínimos de 44px en variantes md y lg (Apple HIG).
 * Gradiente en primary y accent para más impacto visual.
 *
 * @param {{
 *   variant?: 'primary'|'secondary'|'ghost'|'danger'|'accent'|'link',
 *   size?: 'xs'|'sm'|'md'|'lg',
 *   loading?: boolean,
 *   iconLeft?: React.ReactNode,
 *   iconRight?: React.ReactNode,
 *   fullWidth?: boolean,
 * } & React.ButtonHTMLAttributes} props
 */
export default function Button({
  children,
  as: Component = "button",
  type,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  iconLeft,
  iconRight,
  fullWidth = false,
  className = "",
  ...rest
}) {
  const base = [
    "inline-flex items-center justify-center gap-2",
    "font-display font-semibold",
    "rounded-lg",
    "transition-all duration-150",
    "focus:outline-none",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    "select-none cursor-pointer",
    "active:scale-[0.97]",
    fullWidth ? "w-full" : "",
  ].join(" ");

  const variants = {
    primary: [
      /* Gradiente de profundidad — ink-500 → ink-700 */
      "bg-[image:var(--gradient-primary)]",
      "bg-ink-600",                          /* fallback */
      "text-white",
      "shadow-md",
      "hover:shadow-lg hover:brightness-110",
      "active:shadow-sm",
      "focus-visible:[box-shadow:var(--shadow-focus)]",
    ].join(" "),

    secondary: [
      "bg-surface text-text-primary",
      "border border-border",
      "shadow-xs",
      "hover:bg-surface-subtle hover:border-border-strong hover:shadow-sm",
      "active:bg-surface-sunken",
      "focus-visible:[box-shadow:var(--shadow-focus)]",
    ].join(" "),

    ghost: [
      "bg-transparent text-text-secondary",
      "hover:bg-surface-subtle hover:text-text-primary",
      "active:bg-surface-sunken",
      "focus-visible:[box-shadow:var(--shadow-focus)]",
    ].join(" "),

    danger: [
      "bg-error text-white",
      "shadow-sm",
      "hover:brightness-110 hover:shadow-md",
      "active:brightness-90",
      "focus-visible:[box-shadow:var(--shadow-focus-error)]",
    ].join(" "),

    accent: [
      /* Gradiente dorado del cartógrafo */
      "bg-[image:var(--gradient-accent)]",
      "bg-amber-500",                        /* fallback */
      "text-[oklch(14%_0.040_65)]",
      "shadow-md",
      "hover:shadow-lg hover:brightness-105",
      "active:shadow-sm",
      "focus-visible:[box-shadow:var(--shadow-focus-amber)]",
    ].join(" "),

    link: [
      "bg-transparent text-ink-600 underline-offset-4",
      "hover:underline hover:text-ink-700",
      "active:text-ink-800",
      "focus-visible:[box-shadow:var(--shadow-focus)]",
      "p-0 h-auto! rounded-none",
    ].join(" "),
  };

  /* Tamaños — md/lg cumplen 44px mínimo touch target */
  const sizes = {
    xs: "h-7  px-2.5 text-xs gap-1",
    sm: "h-8  px-3.5 text-xs gap-1.5",
    md: "h-11 px-4.5 text-sm gap-2",    /* 44px */
    lg: "h-12 px-6   text-base gap-2",  /* 48px */
  };

  /* Para variant link, ignorar height del size */
  const sizeClass = variant === "link" ? "" : (sizes[size] ?? sizes.md);

  const isNativeButton = Component === "button";
  const isDisabled = Boolean(disabled || loading);

  const componentProps = isNativeButton
    ? {
        type: type ?? "button",
        disabled: isDisabled,
      }
    : {
        "aria-disabled": isDisabled || undefined,
        tabIndex: isDisabled ? -1 : rest.tabIndex,
      };

  const nonButtonDisabledClass = !isNativeButton && isDisabled
    ? "opacity-40 pointer-events-none cursor-not-allowed"
    : "";

  return (
    <Component
      className={[
        base,
        variants[variant] ?? variants.primary,
        sizeClass,
        nonButtonDisabledClass,
        className,
      ].join(" ")}
      {...rest}
      {...componentProps}
    >
      {loading ? (
        /* Spinner inline */
        <svg
          className="shrink-0 animate-spin"
          style={{ width: size === "lg" ? "1.125rem" : "0.9375rem", height: size === "lg" ? "1.125rem" : "0.9375rem" }}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
          <path
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : iconLeft ? (
        <span className="shrink-0" style={{ width: size === "lg" ? "1.125rem" : "1rem", height: size === "lg" ? "1.125rem" : "1rem" }}>
          {iconLeft}
        </span>
      ) : null}

      {/* Ocultar label en loading si se desea estado limpio */}
      <span className={loading ? "opacity-0 absolute" : undefined}>
        {children}
      </span>

      {!loading && iconRight && (
        <span className="shrink-0" style={{ width: size === "lg" ? "1.125rem" : "1rem", height: size === "lg" ? "1.125rem" : "1rem" }}>
          {iconRight}
        </span>
      )}
    </Component>
  );
}
