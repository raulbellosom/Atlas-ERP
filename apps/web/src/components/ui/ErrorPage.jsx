import Button from '@/components/ui/Button';

/* ─── Inline SVG icons — one per error family ─────────────────────────────── */

const ICONS = {
  // 404 — Compass: destination not found
  404: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="26" cy="26" r="21" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="26" cy="26" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3.5" />
      <path d="M26 15v3M26 34v3M15 26h3M34 26h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M26 21v4.5l3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="26" cy="26" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  ),

  // 403 — Shield blocked: access denied
  403: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M26 5L9 13v11c0 9.8 7.3 19 17 21.5C36.7 43 44 33.8 44 24V13L26 5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M19 19l14 14M33 19L19 33" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  ),

  // 401 — Padlock: authentication required
  401: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="12" y="23" width="28" height="21" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19 23v-7a7 7 0 0114 0v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="26" cy="33" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M26 36v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  // 500 — Triangle alert: server error
  500: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M26 8L5 44h42L26 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M26 23v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="26" cy="38" r="1.75" fill="currentColor" />
    </svg>
  ),

  // 400 — Document with X: bad request
  400: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M13 6h20l10 10v30a2 2 0 01-2 2H13a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M33 6v10h10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20 26l12 12M32 26L20 38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

const DEFAULT_ICON = (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="26" cy="26" r="21" stroke="currentColor" strokeWidth="1.5" />
    <path d="M26 16v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="26" cy="36" r="1.75" fill="currentColor" />
  </svg>
);

/* ─── Error configuration per HTTP status ─────────────────────────────────── */

const CONFIGS = {
  400: {
    category: 'Solicitud incorrecta',
    title: 'Datos inválidos',
    description:
      'La solicitud no pudo procesarse. Verifica los datos ingresados e inténtalo de nuevo.',
  },
  401: {
    category: 'Autenticación requerida',
    title: 'Sesión no iniciada',
    description:
      'Necesitas iniciar sesión para acceder a este recurso protegido.',
    primaryHref: '/login',
    primaryLabel: 'Iniciar sesión',
  },
  403: {
    category: 'Acceso denegado',
    title: 'Sin permisos suficientes',
    description:
      'Tu cuenta no tiene permiso para ver esta sección. Contacta al administrador si crees que esto es un error.',
  },
  404: {
    category: 'Recurso no encontrado',
    title: 'Página no encontrada',
    description:
      'La dirección que buscas no existe o fue movida. Verifica la URL o regresa al dashboard.',
  },
  500: {
    category: 'Error del servidor',
    title: 'Algo salió mal',
    description:
      'Ocurrió un error inesperado en el servidor. El equipo técnico ha sido notificado automáticamente.',
  },
};

/* ─── Component ───────────────────────────────────────────────────────────── */

/**
 * ErrorPage — Meridian v2 Design System
 *
 * Full-screen error page for HTTP status codes (400–500).
 * Split-panel layout: dark ink panel with large code + SVG icon on the left,
 * clean surface panel with title, description, and CTA buttons on the right.
 *
 * Works both inside and outside React Router — navigation falls back to
 * window.location when no handlers are provided.
 *
 * @param {{
 *   code?: number,
 *   title?: string,
 *   description?: string,
 *   primaryLabel?: string,
 *   onPrimaryAction?: () => void,
 *   secondaryLabel?: string,
 *   onSecondaryAction?: () => void,
 * }} props
 */
export default function ErrorPage({
  code = 404,
  title,
  description,
  primaryLabel,
  onPrimaryAction,
  secondaryLabel = 'Regresar',
  onSecondaryAction,
}) {
  const config = CONFIGS[code] ?? {
    category: 'Error inesperado',
    title: 'Algo salió mal',
    description: 'Ocurrió un problema. Intenta recargar la página.',
  };

  const resolvedTitle       = title       ?? config.title;
  const resolvedDescription = description ?? config.description;
  const resolvedPrimaryLabel = primaryLabel ?? config.primaryLabel ?? 'Ir al dashboard';

  function handlePrimary() {
    if (onPrimaryAction) { onPrimaryAction(); return; }
    window.location.href = config.primaryHref ?? '/dashboard';
  }

  function handleSecondary() {
    if (onSecondaryAction) { onSecondaryAction(); return; }
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/';
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Dark ink panel (left / top on mobile) ── */}
      <div
        className="lg:w-5/12 flex flex-col items-center justify-center py-20 px-10 relative overflow-hidden"
        style={{ background: 'var(--gradient-sidebar)' }}
      >
        {/* Subtle dot-grid texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: [
              'linear-gradient(oklch(100% 0 0 / 0.035) 1px, transparent 1px)',
              'linear-gradient(90deg, oklch(100% 0 0 / 0.035) 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: '40px 40px',
          }}
        />

        {/* Amber radial glow from the bottom */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 inset-x-0 h-56 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 90% 100% at 50% 100%, oklch(70% 0.13 65 / 0.07) 0%, transparent 70%)',
          }}
        />

        {/* Icon */}
        <div
          className="relative z-10 mb-8"
          style={{ color: 'oklch(45% 0.065 245)' }}
        >
          {ICONS[code] ?? DEFAULT_ICON}
        </div>

        {/* Large error code — amber gradient text */}
        <div
          aria-label={`Error ${code}`}
          className="relative z-10 font-mono font-bold leading-none tracking-tighter select-none"
          style={{
            fontSize: 'clamp(5rem, 14vw, 8.5rem)',
            background: 'var(--gradient-accent)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {code}
        </div>

        {/* Amber accent line */}
        <div
          aria-hidden="true"
          className="relative z-10 mt-10 h-px w-14 rounded-full opacity-50"
          style={{ background: 'var(--gradient-accent)' }}
        />
      </div>

      {/* ── Content panel (right / bottom on mobile) ── */}
      <div className="lg:w-7/12 flex items-center bg-surface border-t border-border lg:border-t-0 lg:border-l">
        <div className="w-full max-w-lg py-16 px-8 lg:px-14 xl:px-20">

          {/* Category label */}
          <p
            className="font-display font-semibold text-[0.7rem] tracking-[0.14em] uppercase mb-5"
            style={{ color: 'oklch(50% 0.07 245)' }}
          >
            {config.category}
          </p>

          {/* Title */}
          <h1
            className="font-display font-extrabold text-text-primary leading-[1.15] mb-5"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
          >
            {resolvedTitle}
          </h1>

          {/* Description */}
          <p className="font-sans text-base text-text-secondary leading-relaxed mb-10">
            {resolvedDescription}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="md" onClick={handlePrimary}>
              {resolvedPrimaryLabel}
            </Button>
            <Button variant="secondary" size="md" onClick={handleSecondary}>
              {secondaryLabel}
            </Button>
          </div>

          {/* Footer attribution */}
          <p className="mt-14 font-mono text-[0.65rem] text-text-disabled tracking-widest uppercase">
            Atlas ERP · HTTP {code}
          </p>
        </div>
      </div>
    </div>
  );
}
