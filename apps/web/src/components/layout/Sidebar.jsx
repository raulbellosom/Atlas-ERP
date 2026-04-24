import { NavLink, useLocation } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useInstalledModules } from '@/hooks/useInstalledModules';

/**
 * Sidebar — Meridian v2 Design System
 *
 * Navegación principal del ERP con identidad visual «Lapislázuli» intensificada:
 * - Fondo: gradiente vertical ink-950 → ink-900 (gradient-sidebar)
 * - Activo: pill con background ink-700/50 + acento izquierdo amber + texto blanco
 * - Logo: isotipo compás con brillo ambient sobre fondo profundo
 * - Mobile: drawer overlay con animación spring
 *
 * Desktop (lg+): sidebar fija w-64 con etiquetas de territorio
 * Mobile (<lg):  drawer overlay Radix Dialog
 */

const NAV_GROUPS = [
  {
    label: 'Explorador',
    items: [
      {
        to: '/dashboard',
        label: 'Dashboard',
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Tesorería',
    moduleKey: 'financial-operations',
    items: [
      {
        to: '/financial-operations/bank-accounts',
        label: 'Cuentas',
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
            <path d="M6 15h4" />
            <circle cx="17" cy="15" r="1" fill="currentColor" />
          </svg>
        ),
      },
      {
        to: '/financial-operations/movements',
        label: 'Movimientos',
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        ),
      },
      {
        to: '/financial-operations/balances',
        label: 'Saldos',
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="2" x2="12" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        ),
      },
      {
        to: '/financial-operations/reconciliation',
        label: 'Conciliación',
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        ),
      },
      {
        to: '/financial-operations/receivables',
        label: 'CxC',
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
            <path d="M5 7.5C5 5.57 6.57 4 8.5 4s3.5 1.57 3.5 3.5" />
          </svg>
        ),
      },
      {
        to: '/financial-operations/payables',
        label: 'CxP',
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
            <path d="M19 16.5C19 18.43 17.43 20 15.5 20s-3.5-1.57-3.5-3.5" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Administración',
    items: [
      {
        to: '/users',
        label: 'Usuarios',
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        to: '/roles',
        label: 'Roles',
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
      },
      {
        to: '/attachments',
        label: 'Adjuntos',
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Sistema',
    items: [
      {
        to: '/audit',
        label: 'Auditoría',
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        ),
      },
      {
        to: '/sync',
        label: 'Sync Center',
        syncBadge: true,
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
            <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
          </svg>
        ),
      },
      {
        to: '/module-store',
        label: 'Module Store',
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 8a2 2 0 0 0-1.05-1.76l-7-3.94a2 2 0 0 0-1.9 0l-7 3.94A2 2 0 0 0 3 8v8a2 2 0 0 0 1.05 1.76l7 3.94a2 2 0 0 0 1.9 0l7-3.94A2 2 0 0 0 21 16z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        ),
      },
      {
        to: '/settings',
        label: 'Configuración',
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
];

/* ─── Logo isotipo ─────────────────────────────────────────────────────────── */
function AtlasLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 36 36" fill="none" aria-label="AtlasERP" role="img">
      {/* Halo ambient — círculo exterior difuso */}
      <circle cx="18" cy="18" r="17" fill="oklch(55% 0.148 245 / 0.08)" />
      {/* Círculo meridiano */}
      <circle
        cx="18"
        cy="18"
        r="15"
        stroke="oklch(55% 0.148 245 / 0.40)"
        strokeWidth="1"
        strokeDasharray="3 2.5"
      />
      {/* Piernas del compás — oro intenso */}
      <path
        d="M18 5.5 L9.5 30"
        stroke="oklch(78% 0.180 65)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M18 5.5 L26.5 30"
        stroke="oklch(78% 0.180 65)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Travesaño — azul cobalto */}
      <path
        d="M13 21.5 L23 21.5"
        stroke="oklch(67% 0.122 245)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Nodos */}
      <circle cx="13" cy="21.5" r="1.5" fill="oklch(67% 0.122 245)" />
      <circle cx="23" cy="21.5" r="1.5" fill="oklch(67% 0.122 245)" />
      <circle cx="18" cy="21.5" r="1.5" fill="oklch(78% 0.180 65)" />
      {/* Pivote dorado con brillo */}
      <circle cx="18" cy="5.5" r="2.8" fill="oklch(78% 0.180 65)" />
      <circle cx="18" cy="5.5" r="1.2" fill="oklch(52% 0.150 65)" />
      <circle cx="16.8" cy="4.4" r="0.6" fill="oklch(90% 0.100 65 / 0.7)" />
    </svg>
  );
}

/* ─── Contenido compartido desktop/mobile ─────────────────────────────────── */
function SidebarContent({ onNavigate }) {
  const { pendingCount } = useSyncStatus();
  const location = useLocation();
  const { installedModules, isLoading: isLoadingModules } = useInstalledModules();

  return (
    <div className="flex flex-col h-full">
      {/* ── Logo area ── */}
      <div className="h-[4.25rem] flex items-center gap-3 px-5 shrink-0 border-b border-white/5">
        <AtlasLogo />
        <div className="flex flex-col min-w-0">
          <span
            className="text-[15px] font-bold tracking-tight text-white leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            AtlasERP
          </span>
          <span className="text-[9px] text-amber-500/60 tracking-[0.20em] uppercase font-mono mt-0.5">
            Meridian
          </span>
        </div>
      </div>

      {/* ── Navegación ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6" role="navigation">
        {NAV_GROUPS.filter((group) => {
          if (!group.moduleKey) return true;
          if (isLoadingModules) return true;
          return installedModules.has(group.moduleKey);
        }).map((group) => (
          <div key={group.label}>
            {/* Etiqueta de sección */}
            <p className="px-3 mb-1.5 text-[0.625rem] font-semibold tracking-[0.12em] uppercase text-ink-500 select-none">
              {group.label}
            </p>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
                const badge = item.syncBadge ? pendingCount : 0;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={[
                      'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl',
                      'text-sm font-medium',
                      'transition-all duration-150',
                      'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus-amber)]',
                      isActive
                        ? /* Activo: fondo ink con brillo + acento izquierdo amber */
                          'bg-white/8 text-white shadow-[inset_0_1px_0_oklch(100%_0_0/0.06),inset_3px_0_0_oklch(78%_0.180_65)]'
                        : 'text-ink-400 hover:bg-white/5 hover:text-ink-100',
                    ].join(' ')}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {/* Icono */}
                    <span
                      className={[
                        'w-4.5 h-4.5 shrink-0 transition-colors duration-150',
                        isActive ? 'text-amber-400' : 'text-ink-500 group-hover:text-ink-300',
                      ].join(' ')}
                    >
                      {item.icon}
                    </span>

                    {/* Label */}
                    <span className="flex-1 truncate">{item.label}</span>

                    {/* Badge de sync */}
                    {badge > 0 && (
                      <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-amber-500 text-ink-950 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="px-5 py-3.5 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full bg-success animate-[atlas-pulse_2.5s_ease-in-out_infinite] shrink-0"
            aria-hidden="true"
          />
          <p className="text-[10px] text-ink-500 font-mono tracking-wide">v0.1.0 · Meridian v2</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Desktop Sidebar ──────────────────────────────────────────────────────── */
function DesktopSidebar() {
  return (
    <aside
      className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0"
      style={{ background: 'var(--gradient-sidebar)' }}
    >
      <SidebarContent />
    </aside>
  );
}

/* ─── Mobile Sidebar (Drawer) ─────────────────────────────────────────────── */
function MobileSidebar({ open, onClose }) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={[
            'fixed inset-0 z-40 bg-surface-overlay backdrop-blur-md lg:hidden',
            'data-[state=open]:animate-[atlas-overlay-in_200ms_ease-out]',
            'data-[state=closed]:animate-[atlas-overlay-out_150ms_ease-in]',
          ].join(' ')}
        />
        <Dialog.Content
          className={[
            'fixed inset-y-0 left-0 z-50 flex flex-col w-72 lg:hidden',
            'data-[state=open]:animate-[atlas-slide-in-left_260ms_cubic-bezier(0.34,1.2,0.64,1)]',
            'data-[state=closed]:animate-[atlas-slide-out-left_200ms_ease-in]',
            'focus:outline-none',
          ].join(' ')}
          style={{ background: 'var(--gradient-sidebar)' }}
        >
          <Dialog.Title className="sr-only">Menú de navegación</Dialog.Title>
          <Dialog.Description className="sr-only">
            Navegación principal de AtlasERP
          </Dialog.Description>
          <SidebarContent onNavigate={onClose} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { DesktopSidebar, MobileSidebar, NAV_GROUPS };
export default function Sidebar() {
  return <DesktopSidebar />;
}
