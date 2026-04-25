import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import TopBar from '@/components/layout/TopBar';

const INSTANCIA_NAV = [
  {
    label: 'Sistema',
    items: [
      {
        to: '/instancia',
        label: 'Salud del sistema',
        exact: true,
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
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
      },
      {
        to: '/instancia/sesiones',
        label: 'Sesiones',
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
            <rect x="2" y="2" width="20" height="8" rx="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" />
            <line x1="6" y1="6" x2="6.01" y2="6" />
            <line x1="6" y1="18" x2="6.01" y2="18" />
          </svg>
        ),
      },
      {
        to: '/instancia/funciones',
        label: 'Feature flags',
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
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
        ),
      },
    ],
  },
];

function HomeButton({ onClick }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => {
        navigate('/dashboard');
        onClick?.();
      }}
      className={[
        'group flex items-center gap-2.5 px-3 py-2 rounded-xl w-full',
        'text-ink-400 hover:bg-white/5 hover:text-ink-100',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus-amber)]',
      ].join(' ')}
      aria-label="Volver al launcher"
    >
      <span className="w-4.5 h-4.5 shrink-0 text-ink-500 group-hover:text-ink-300 transition-colors duration-150">
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
      </span>
      <span className="text-sm font-medium">Aplicaciones</span>
    </button>
  );
}

function SidebarContent({ onNavigate }) {
  const location = useLocation();
  return (
    <div className="flex flex-col h-full">
      <div className="h-17 flex items-center gap-3 px-5 shrink-0 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-500/20 shrink-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="oklch(67% 0.10 245)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="8" rx="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" />
            <line x1="6" y1="6" x2="6.01" y2="6" />
            <line x1="6" y1="18" x2="6.01" y2="18" />
          </svg>
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="text-[15px] font-bold tracking-tight text-white leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Instancia
          </span>
          <span className="text-[9px] text-slate-400/60 tracking-[0.20em] uppercase font-mono mt-0.5">
            Sistema
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" role="navigation">
        <HomeButton onClick={onNavigate} />
        <div className="my-3 h-px bg-white/5" />

        {INSTANCIA_NAV.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-3 mb-1.5 text-[0.625rem] font-semibold tracking-[0.12em] uppercase text-ink-500 select-none">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = item.exact
                  ? location.pathname === item.to
                  : location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={[
                      'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus-amber)]',
                      isActive
                        ? 'bg-white/8 text-white shadow-[inset_0_1px_0_oklch(100%_0_0/0.06),inset_3px_0_0_oklch(78%_0.180_65)]'
                        : 'text-ink-400 hover:bg-white/5 hover:text-ink-100',
                    ].join(' ')}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span
                      className={[
                        'w-4.5 h-4.5 shrink-0 transition-colors duration-150',
                        isActive ? 'text-amber-400' : 'text-ink-500 group-hover:text-ink-300',
                      ].join(' ')}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-5 py-3.5 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" aria-hidden="true" />
          <p className="text-[10px] text-ink-500 font-mono tracking-wide">instancia</p>
        </div>
      </div>
    </div>
  );
}

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
          <Dialog.Title className="sr-only">Menú de Instancia</Dialog.Title>
          <Dialog.Description className="sr-only">Navegación de Instancia</Dialog.Description>
          <SidebarContent onNavigate={onClose} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function InstanciaLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-surface-page">
      <DesktopSidebar />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        <TopBar onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
