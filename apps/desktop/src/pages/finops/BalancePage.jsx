/**
 * BalancePage — Desktop (offline-aware).
 *
 * Muestra el balance summary consolidado por organización.
 * En modo offline muestra timestamp del último sync y advertencia
 * si los datos tienen más de 24 horas.
 *
 * Task origen: T-1505 (Fase 15 Bloque 2)
 */

import { useBalanceSummaryDesktop } from "../../modules/finops/hooks/useBalanceSummaryDesktop.js";
import { printReport } from "../../modules/finops/utils/printReport.js";

function formatCurrency(amount, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount ?? 0);
}

function formatDate(isoDate) {
  if (!isoDate) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

function OfflineBanner({ cachedAt, isStaleWarning }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
        isStaleWarning
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      <span className="mt-0.5 text-base">{isStaleWarning ? "🔴" : "⚠️"}</span>
      <div>
        <p className="font-medium">
          {isStaleWarning
            ? "Saldo puede estar desactualizado (más de 24 h sin sincronizar)"
            : "Sin conexión — mostrando saldo local"}
        </p>
        {cachedAt && (
          <p className="mt-0.5 text-xs opacity-80">
            Saldo al: <strong>{formatDate(cachedAt)}</strong>
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * @param {{ organizationId: string, isOnline: boolean, currency?: string }} props
 */
export default function BalancePage({ organizationId, isOnline = true, currency = "MXN" }) {
  const { summary, loading, error, isOffline, cachedAt, isStaleWarning, refetch } =
    useBalanceSummaryDesktop(organizationId, { isOnline, currency });

  return (
    <div id="finops-balance-print" className="space-y-4">
      <div className="flex items-center justify-between">
        <div data-report-header>
          <h2 className="text-lg font-semibold text-slate-900">Balance consolidado</h2>
          <p className="text-sm text-slate-500">{currency}</p>
        </div>
        <div className="flex items-center gap-2" data-print="hide">
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
          <button
            type="button"
            onClick={() => printReport({ containerId: "finops-balance-print", title: "Balance consolidado" })}
            disabled={!summary}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Imprimir
          </button>
        </div>
      </div>

      {isOffline && <OfflineBanner cachedAt={cachedAt} isStaleWarning={isStaleWarning} />}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading && !summary ? (
        <div className="py-12 text-center text-sm text-slate-500">Cargando balance…</div>
      ) : !summary ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <p className="text-2xl">💰</p>
          <p className="mt-3 text-sm font-medium text-slate-700">
            {isOffline
              ? "Sin datos locales. Conecta para ver los saldos."
              : "No hay datos de balance disponibles."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Saldo total
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatCurrency(summary.total, currency)}
            </p>
            {isOffline && cachedAt && (
              <p className="mt-1 text-xs text-slate-400">al {formatDate(cachedAt)}</p>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cuentas activas
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {summary.activeAccounts ?? "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
