/**
 * FinancialMovementsPage — Desktop (offline-aware).
 *
 * Lista los movimientos financieros desde caché SQLite cuando offline.
 * Movimientos PENDING_SYNC se muestran con badge amarillo.
 *
 * Task origen: T-1504 (Fase 15 Bloque 1)
 */

import { useFinancialMovementsDesktop } from "../../modules/finops/hooks/useFinancialMovementsDesktop.js";
import { printReport } from "../../modules/finops/utils/printReport.js";

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
      <span>⚠️</span>
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

function PendingSyncBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Pendiente sync
    </span>
  );
}

function MovementRow({ movement }) {
  const isPending = movement.status === "PENDING_SYNC";
  const isIncome = movement.type === "INCOME" || movement.type === "CREDIT";

  return (
    <tr className={`border-b border-slate-100 last:border-0 ${isPending ? "bg-amber-50/40" : ""}`}>
      <td className="py-3 pl-4 pr-3 text-sm text-slate-600">{movement.movementDate ?? "—"}</td>
      <td className="px-3 py-3 text-sm text-slate-700">{movement.description ?? "Sin descripción"}</td>
      <td className="px-3 py-3 text-sm text-slate-500">{movement.type ?? "—"}</td>
      <td className={`px-3 py-3 text-right font-mono text-sm font-semibold ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
        {isIncome ? "+" : "-"}{formatCurrency(Math.abs(movement.amount ?? 0), movement.currency)}
      </td>
      <td className="px-3 py-3 text-sm">
        {isPending ? (
          <PendingSyncBadge />
        ) : (
          <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {movement.status ?? "OK"}
          </span>
        )}
      </td>
    </tr>
  );
}

/**
 * @param {{ bankAccountId?: string, isOnline: boolean }} props
 */
export default function FinancialMovementsPage({ bankAccountId, isOnline = true }) {
  const { data, loading, error, isOffline, lastSyncedAt, refetch } = useFinancialMovementsDesktop(
    bankAccountId ?? null,
    { isOnline },
  );

  return (
    <div id="finops-movements-print" className="space-y-4">
      <div className="flex items-center justify-between">
        <div data-report-header>
          <h2 className="text-lg font-semibold text-slate-900">Movimientos financieros</h2>
          <p className="text-sm text-slate-500">{data.length} movimiento{data.length !== 1 ? "s" : ""}</p>
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
            onClick={() => printReport({ containerId: "finops-movements-print", title: "Movimientos financieros" })}
            disabled={data.length === 0}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Imprimir
          </button>
        </div>
      </div>

      {isOffline && <OfflineBanner lastSyncedAt={lastSyncedAt} />}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading && data.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500">Cargando movimientos…</div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <p className="text-2xl">💳</p>
          <p className="mt-3 text-sm font-medium text-slate-700">
            {isOffline ? "Sin datos locales. Conecta para sincronizar." : "No hay movimientos en los últimos 90 días."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Descripción</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo</th>
                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Monto</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.map((movement) => (
                <MovementRow key={movement.id} movement={movement} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
