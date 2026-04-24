import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import TopBar from '@/components/layout/TopBar';

const ACCOUNTING_NAV = [
  {
    label: 'Contabilidad',
    items: [
      {
        to: '/accounting/chart-of-accounts',
        label: 'Plan de cuentas',
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
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        ),
      },
      {
        to: '/accounting/journal-entries',
        label: 'Asientos',
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
        to: '/accounting/fiscal-periods',
        label: 'Períodos fiscales',
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
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Informes',
    items: [
      {
        to: '/accounting/reports/income-statement',
        label: 'Estado de resultados',
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
        to: '/accounting/reports/balance-sheet',
        label: 'Balance general',
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
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        ),
      },
      {
        to: '/accounting/reports/trial-balance',
        label: 'Balance de comprobación',
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
            stroke="oklch(67% 0.19 160)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M9 13h6M9 17h4" />
          </svg>
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="text-[15px] font-bold tracking-tight text-white leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Contabilidad
          </span>
          <span className="text-[9px] text-emerald-400/60 tracking-[0.20em] uppercase font-mono mt-0.5">
            accounting
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" role="navigation">
        <HomeButton onClick={onNavigate} />
        <div className="my-3 h-px bg-white/5" />

        {ACCOUNTING_NAV.map((group) => (
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
          <p className="text-[10px] text-ink-500 font-mono tracking-wide">accounting</p>
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
          <Dialog.Title className="sr-only">Menú de Contabilidad</Dialog.Title>
          <Dialog.Description className="sr-only">Navegación de Contabilidad</Dialog.Description>
          <SidebarContent onNavigate={onClose} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function AccountingLayout() {
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
