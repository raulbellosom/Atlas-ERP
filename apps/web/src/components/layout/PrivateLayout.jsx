import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { DesktopSidebar, MobileSidebar } from './Sidebar';
import TopBar from './TopBar';
import OfflineBanner from '@/components/ui/OfflineBanner';

/**
 * PrivateLayout — AppShell responsive «El Compás del Navegante»
 *
 * Layout principal de la aplicación autenticada.
 *
 * Mobile (<lg):
 * ┌──────────────────────────┐
 * │ TopBar [☰]          [👤] │
 * ├──────────────────────────┤
 * │                          │
 * │   Main content           │
 * │   (full-width, px-4)     │
 * │                          │
 * └──────────────────────────┘
 * + Sidebar como drawer overlay (Radix Dialog)
 *
 * Desktop (lg+):
 * ┌────────┬─────────────────┐
 * │ Side   │ TopBar           │
 * │ bar    ├─────────────────┤
 * │ ink-   │ Main content     │
 * │ 950    │ (px-6, max-w)    │
 * │ w-60   │                  │
 * │        │                  │
 * └────────┴─────────────────┘
 */
export default function PrivateLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-surface-subtle">
      {/* Desktop sidebar — visible solo en lg+ */}
      <DesktopSidebar />

      {/* Mobile sidebar drawer */}
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        <OfflineBanner />
        <TopBar onMenuToggle={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-6 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
