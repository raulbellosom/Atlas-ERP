/**
 * BankAccountsPage — Desktop (offline-aware).
 *
 * Versión desktop de la página de cuentas bancarias.
 * Usa useBankAccountsDesktop para servir desde caché SQLite cuando offline.
 *
 * Task origen: T-1503 (Fase 15 Bloque 1)
 */

import { useBankAccountsDesktop } from "../../modules/finops/hooks/useBankAccountsDesktop.js";

function formatCurrency(amount, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount ?? 0);
}

function formatRelativeTime(isoDate) {
  if (!isoDate) return "nunca";
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "hace menos de 1 minuto";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} días`;
}

function OfflineBanner({ lastSyncedAt }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
      <span className="text-base">⚠️</span>
      <span>
        Sin conexión. Mostrando datos locales.
        {lastSyncedAt ? (
          <> Última sincronización: <strong>{formatRelativeTime(lastSyncedAt)}</strong>.</>
        ) : (
          " Sin datos locales disponibles aún."
        )}
      </span>
    </div>
  );
}

function EmptyState({ isOffline }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
      <p className="text-2xl">🏦</p>
      <p className="mt-3 text-sm font-medium text-slate-700">
        {isOffline ? "Sin datos locales. Conecta para sincronizar." : "No hay cuentas bancarias registradas."}
      </p>
    </div>
  );
}

function AccountRow({ account }) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-3 pl-4 pr-3 text-sm font-medium text-slate-900">{account.name}</td>
      <td className="px-3 py-3 text-sm text-slate-600">{account.accountNumber ?? "—"}</td>
      <td className="px-3 py-3 text-right font-mono text-sm font-semibold text-slate-900">
        {formatCurrency(account.balance, account.currency)}
      </td>
      <td className="px-3 py-3 text-sm text-slate-500">{account.currency ?? "MXN"}</td>
      <td className="px-3 py-3 text-sm">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
            account.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {account.isActive ? "Activa" : "Inactiva"}
        </span>
      </td>
    </tr>
  );
}

/**
 * @param {{ organizationId: string, isOnline: boolean }} props
 */
export default function BankAccountsPage({ organizationId, isOnline = true }) {
  const { data, loading, error, isOffline, lastSyncedAt, refetch } = useBankAccountsDesktop(
    organizationId,
    { isOnline },
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Cuentas bancarias</h2>
          <p className="text-sm text-slate-500">{data.length} cuenta{data.length !== 1 ? "s" : ""}</p>
        </div>
        {!isOffline && (
          <button
            type="button"
            onClick={refetch}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "Actualizando…" : "Actualizar"}
          </button>
        )}
      </div>

      {isOffline && <OfflineBanner lastSyncedAt={lastSyncedAt} />}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading && data.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500">Cargando cuentas…</div>
      ) : data.length === 0 ? (
        <EmptyState isOffline={isOffline} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nombre</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">N° de cuenta</th>
                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Saldo</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Moneda</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.map((account) => (
                <AccountRow key={account.id} account={account} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
