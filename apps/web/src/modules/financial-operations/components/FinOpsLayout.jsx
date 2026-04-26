import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import TopBar from '@/components/layout/TopBar';
import OfflineBanner from '@/modules/financial-operations/components/OfflineBanner';

const FINOPS_NAV = [
  {
    label: 'Tesorería',
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
            <path d="M2 10h20M6 15h4" />
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
      {
        to: '/financial-operations/counterparties',
        label: 'Contrapartes',
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Informes',
    items: [
      {
        to: '/financial-operations/reports/movements',
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        ),
      },
      {
        to: '/financial-operations/reports/movements-by-account',
        label: 'Por cuenta',
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
            <path d="M2 10h20M6 15h4" />
            <circle cx="17" cy="15" r="1" fill="currentColor" />
          </svg>
        ),
      },
      {
        to: '/financial-operations/reports/balances',
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
        to: '/financial-operations/reports/transfers',
        label: 'Transferencias',
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
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        ),
      },
      {
        to: '/financial-operations/reports/receivables',
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
        to: '/financial-operations/reports/payables',
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
      {/* App header */}
      <div className="h-17 flex items-center gap-3 px-5 shrink-0 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500/20 shrink-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="oklch(67% 0.19 245)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="text-[15px] font-bold tracking-tight text-white leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Tesorería
          </span>
          <span className="text-[9px] text-blue-400/60 tracking-[0.20em] uppercase font-mono mt-0.5">
            Tesorería
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" role="navigation">
        <HomeButton onClick={onNavigate} />

        <div className="my-3 h-px bg-white/5" />

        {FINOPS_NAV.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-3 mb-1.5 text-[0.625rem] font-semibold tracking-[0.12em] uppercase text-ink-500 select-none">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.to || location.pathname.startsWith(item.to + '/');
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

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" aria-hidden="true" />
          <p className="text-[10px] text-ink-500 font-mono tracking-wide">financial-operations</p>
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
          <Dialog.Title className="sr-only">Menú de Tesorería</Dialog.Title>
          <Dialog.Description className="sr-only">Navegación de Tesorería</Dialog.Description>
          <SidebarContent onNavigate={onClose} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function FinOpsLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-page">
      <DesktopSidebar />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        <TopBar onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mb-4 empty:hidden">
            <OfflineBanner />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
