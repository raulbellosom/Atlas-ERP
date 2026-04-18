import useAuthStore from "@/store/auth.store";
import ConnectionIndicator from "./ConnectionIndicator";

/**
 * TopBar — Meridian v2 Design System
 *
 * Barra superior del ERP. Superficie elevada sobre el contenido.
 * Mobile: botón hamburguesa prominente + logo inline.
 * Desktop: breadcrumb de contexto + usuario + logout.
 *
 * Avatar con gradiente ink generado del inicial del email.
 *
 * @param {{ onMenuToggle?: () => void }} props
 */
export default function TopBar({ onMenuToggle }) {
  const { user, logout } = useAuthStore();

  const initial = user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header
      className={[
        "h-14 flex items-center justify-between",
        "px-4 md:px-6",
        "bg-surface border-b border-border",
        "[box-shadow:0_1px_0_0_var(--color-border)]",
        "shrink-0 z-10 sticky top-0",
      ].join(" ")}
    >
      {/* ── Izquierda ── */}
      <div className="flex items-center gap-2.5">
        {/* Hamburguesa mobile */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className={[
              "lg:hidden",
              "w-9 h-9 flex items-center justify-center rounded-lg",
              "-ml-1 text-text-secondary",
              "hover:bg-surface-subtle hover:text-text-primary",
              "active:scale-95 active:bg-surface-sunken",
              "transition-all duration-100",
              "focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
            ].join(" ")}
            aria-label="Abrir menú de navegación"
          >
            <svg
              width="18" height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="16" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        {/* Marca — solo visible en desktop cuando no hay sidebar breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 select-none">
          <div className="flex items-center gap-1.5 text-text-disabled">
            {/* Dot de meridiano */}
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: "oklch(72.5% 0.192 65)" }}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold tracking-widest uppercase text-text-disabled" style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem" }}>
              Atlas ERP
            </span>
          </div>
        </div>
      </div>

      {/* ── Derecha ── */}
      <div className="flex items-center gap-1.5 md:gap-2">
        <ConnectionIndicator />

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-border mx-0.5" aria-hidden="true" />

        {/* Usuario */}
        {user && (
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Avatar con gradiente ink */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-1 ring-ink-200"
              style={{ background: "var(--gradient-primary)" }}
              aria-hidden="true"
            >
              <span
                className="text-[11px] font-bold text-white select-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {initial}
              </span>
            </div>
            <span className="text-sm font-medium text-text-secondary truncate max-w-44 leading-none">
              {user.email}
            </span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className={[
            "flex items-center gap-1.5",
            "px-3 py-2 rounded-lg",
            "text-xs font-medium text-text-disabled",
            "hover:bg-error-subtle hover:text-error",
            "active:scale-95",
            "transition-all duration-150",
            "focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus-error)]",
          ].join(" ")}
          aria-label="Cerrar sesión"
        >
          <svg
            width="14" height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
