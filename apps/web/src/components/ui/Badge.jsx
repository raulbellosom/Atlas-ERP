/**
 * Badge — Meridian v2 Design System
 *
 * Pills de estado modernas. Sin rings — color de fondo + texto contraste.
 * Forma pill (rounded-full) para variantes de estado; rounded para "label" compacto.
 *
 * @param {{
 *   variant?: 'neutral'|'primary'|'success'|'error'|'warning'|'info'|'accent'|'dark',
 *   size?: 'xs'|'sm'|'md',
 *   dot?: boolean,
 *   pill?: boolean,     // false = rounded-md (etiqueta), true = pill completo
 *   className?: string
 * }} props
 */
export default function Badge({
  children,
  variant = "neutral",
  size = "sm",
  dot = false,
  pill = true,
  className = "",
}) {
  const base = "inline-flex items-center font-medium whitespace-nowrap leading-none";

  const shape = pill ? "rounded-full" : "rounded-md";

  const sizes = {
    xs: "px-2    py-0.5 text-[0.625rem]  gap-1",
    sm: "px-2.5  py-1   text-[0.6875rem] gap-1.5",
    md: "px-3    py-1   text-xs          gap-1.5",
  };

  /* Colores: background suave + texto contrastado (sin rings ni bordes) */
  const variants = {
    neutral: "bg-neutral-100  text-neutral-700",
    primary: "bg-ink-100      text-ink-700",
    success: "bg-success-subtle  text-[oklch(42%_0.130_148)]",
    error:   "bg-error-subtle    text-[oklch(40%_0.180_27)]",
    warning: "bg-warning-subtle  text-[oklch(38%_0.140_75)]",
    info:    "bg-info-subtle     text-[oklch(37%_0.130_210)]",
    accent:  "bg-amber-100    text-amber-800",
    /* Modo oscuro — fondo ink profundo, texto amber */
    dark:    "bg-ink-900      text-amber-300",
  };

  const dotColors = {
    neutral: "bg-neutral-500",
    primary: "bg-ink-500",
    success: "bg-success",
    error:   "bg-error",
    warning: "bg-warning",
    info:    "bg-info",
    accent:  "bg-amber-500",
    dark:    "bg-amber-400",
  };

  const dotSizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-1.5 h-1.5",
    md: "w-2   h-2",
  };

  return (
    <span
      className={[
        base,
        shape,
        sizes[size]    ?? sizes.sm,
        variants[variant] ?? variants.neutral,
        className,
      ].join(" ")}
    >
      {dot && (
        <span
          className={[
            "block rounded-full shrink-0 animate-[atlas-pulse_2s_ease-in-out_infinite]",
            dotSizes[size]    ?? dotSizes.sm,
            dotColors[variant] ?? dotColors.neutral,
          ].join(" ")}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
