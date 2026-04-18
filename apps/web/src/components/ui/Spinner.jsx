/**
 * Spinner de carga circular.
 * @param {{ size?: 'sm'|'md'|'lg', className?: string }} props
 */
export default function Spinner({ size = "md", className = "" }) {
  const sizes = { sm: "w-4 h-4 border-2", md: "w-6 h-6 border-2", lg: "w-8 h-8 border-2" };
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={[
        sizes[size],
        "rounded-full border-brand-200 border-t-brand-500 animate-spin",
        className,
      ].join(" ")}
    />
  );
}

/**
 * Página completa centrada con spinner.
 */
export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-subtle">
      <Spinner size="lg" />
    </div>
  );
}
