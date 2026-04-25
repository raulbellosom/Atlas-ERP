import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import TopBar from '@/components/layout/TopBar';

const EMPRESA_NAV = [
  {
    label: 'Organización',
    items: [
      {
        to: '/empresa',
        label: 'Resumen',
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
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
      {
        to: '/empresa/perfil',
        label: 'Perfil',
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ),
      },
      {
        to: '/empresa/marca',
        label: 'Identidad visual',
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
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
        ),
      },
      {
        to: '/empresa/configuracion',
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
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/20 shrink-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="oklch(67% 0.19 155)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="7" width="20" height="15" rx="1" />
            <path d="M16 22V7l-4-5-4 5v15" />
            <line x1="9" y1="12" x2="9" y2="12.01" />
            <line x1="15" y1="12" x2="15" y2="12.01" />
          </svg>
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="text-[15px] font-bold tracking-tight text-white leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Empresa
          </span>
          <span className="text-[9px] text-emerald-400/60 tracking-[0.20em] uppercase font-mono mt-0.5">
            Organización
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" role="navigation">
        <HomeButton onClick={onNavigate} />
        <div className="my-3 h-px bg-white/5" />

        {EMPRESA_NAV.map((group) => (
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
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
          <p className="text-[10px] text-ink-500 font-mono tracking-wide">empresa</p>
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
          <Dialog.Title className="sr-only">Menú de Empresa</Dialog.Title>
          <Dialog.Description className="sr-only">Navegación de Empresa</Dialog.Description>
          <SidebarContent onNavigate={onClose} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function EmpresaLayout() {
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
