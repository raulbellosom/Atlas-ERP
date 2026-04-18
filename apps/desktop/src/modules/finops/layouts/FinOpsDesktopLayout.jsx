/**
 * FinOpsDesktopLayout — layout desktop del módulo FinOps.
 *
 * Incluye:
 *   - Sidebar de navegación con 7 secciones del módulo.
 *   - OfflineBanner cuando isOffline es true.
 *   - FinOpsSyncQueuePanel colapsable con badge de pendientes.
 *   - Notificación de recovery al reiniciar con ítems pendientes.
 *
 * Task origen: T-1512 (Fase 15 Bloque 3)
 */

import { useState } from "react";
import { FinOpsSyncQueuePanel } from "../components/FinOpsSyncQueuePanel.jsx";
import { useFinOpsBootRecovery } from "../hooks/useFinOpsBootRecovery.js";

const NAV_ITEMS = [
  { id: "bank-accounts",  label: "Cuentas bancarias", icon: "🏦" },
  { id: "movements",      label: "Movimientos",        icon: "💳" },
  { id: "transfers",      label: "Transferencias",     icon: "↔️" },
  { id: "receivables",    label: "Cuentas por cobrar", icon: "📥" },
  { id: "payables",       label: "Cuentas por pagar",  icon: "📤" },
  { id: "balance",        label: "Balance",            icon: "📊" },
  { id: "reconciliation", label: "Conciliación",       icon: "🔄" },
];

function SidebarNavItem({ item, active, onClick, isOffline }) {
  const isBlocked = isOffline && item.id === "reconciliation";
  return (
    <button
      type="button"
      onClick={() => !isBlocked && onClick(item.id)}
      disabled={isBlocked}
      title={isBlocked ? "No disponible en modo offline" : undefined}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-blue-50 text-blue-700"
          : isBlocked
          ? "cursor-not-allowed text-slate-400"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <span>{item.icon}</span>
      <span>{item.label}</span>
      {isBlocked && <span className="ml-auto text-xs text-slate-400">offline</span>}
    </button>
  );
}

function OfflineBanner() {
  return (
    <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 text-sm text-amber-700">
      <span>⚠️</span>
      <span>Sin conexión — operaciones de solo lectura y creación disponibles.</span>
    </div>
  );
}

function RecoveryNotification({ count, onDismiss }) {
  if (!count) return null;
  return (
    <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
      <span>
        🔄 Se recuperaron <strong>{count}</strong> operación{count !== 1 ? "es" : ""} pendiente{count !== 1 ? "s" : ""} de sync.
      </span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-4 text-xs font-medium underline hover:no-underline"
      >
        Cerrar
      </button>
    </div>
  );
}

/**
 * @param {{
 *   activeSection?: string,
 *   onSectionChange?: (id: string) => void,
 *   isOnline?: boolean,
 *   children?: React.ReactNode,
 * }} props
 */
export function FinOpsDesktopLayout({
  activeSection = "bank-accounts",
  onSectionChange,
  isOnline = true,
  children,
}) {
  const [syncPanelCollapsed, setSyncPanelCollapsed] = useState(true);
  const [recoveryDismissed, setRecoveryDismissed] = useState(false);
  const { recoveredCount, hasRecovery } = useFinOpsBootRecovery();

  // Auto-expandir panel si hay recovery
  useState(() => {
    if (hasRecovery) setSyncPanelCollapsed(false);
  });

  return (
    <div className="flex h-full flex-col">
      {!isOnline && <OfflineBanner />}
      {hasRecovery && !recoveryDismissed && (
        <RecoveryNotification count={recoveredCount} onDismiss={() => setRecoveryDismissed(true)} />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de navegación */}
        <aside className="flex w-52 flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">FinOps</p>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
            {NAV_ITEMS.map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                active={activeSection === item.id}
                onClick={onSectionChange ?? (() => {})}
                isOffline={!isOnline}
              />
            ))}
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>

        {/* Panel lateral de sync */}
        <FinOpsSyncQueuePanel
          collapsed={syncPanelCollapsed}
          onToggle={() => setSyncPanelCollapsed((c) => !c)}
        />
      </div>
    </div>
  );
}
