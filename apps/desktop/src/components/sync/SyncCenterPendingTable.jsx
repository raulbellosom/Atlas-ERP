import { useCallback, useEffect, useState } from "react";
import {
  approveSyncItem,
  listSyncItems,
  rejectSyncItem,
} from "../../modules/sync/localSyncItemsRepository.js";

// ─── Badge helper ─────────────────────────────────────────────────────────────

function StatusBadge({ value }) {
  const tones = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    done: "bg-emerald-100 text-emerald-700",
    failed: "bg-rose-100 text-rose-700",
    conflict_detected: "bg-orange-100 text-orange-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[value] || "bg-slate-100 text-slate-600"}`}
    >
      {value}
    </span>
  );
}

function ApprovalBadge({ value }) {
  const tones = {
    approved: "bg-emerald-100 text-emerald-700",
    pending_review: "bg-amber-100 text-amber-700",
    rejected: "bg-rose-100 text-rose-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[value] || "bg-slate-100 text-slate-600"}`}
    >
      {value ?? "—"}
    </span>
  );
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

// ─── Row actions ─────────────────────────────────────────────────────────────

function RowActions({ item, onRefresh }) {
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    try {
      await approveSyncItem(item.id, "Aprobado manualmente desde Sync Center");
      onRefresh();
    } catch {
      // silencioso — el usuario puede reintentar
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    setLoading(true);
    try {
      await rejectSyncItem(item.id, "Rechazado manualmente desde Sync Center");
      onRefresh();
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }

  if (item.approvalStatus !== "pending_review") return <span className="text-slate-400 text-xs">—</span>;

  return (
    <span className="flex gap-1">
      <button
        type="button"
        disabled={loading}
        className="rounded px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
        onClick={handleApprove}
      >
        Aprobar
      </button>
      <button
        type="button"
        disabled={loading}
        className="rounded px-2 py-0.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
        onClick={handleReject}
      >
        Rechazar
      </button>
    </span>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <tr>
      <td colSpan={7} className="py-10 text-center text-sm text-slate-400">
        No hay items de sincronización pendientes.
      </td>
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * T-1029: Tabla de items pendientes en el Sync Center del desktop.
 * Muestra todos los SyncItems locales con opciones de aprobación/rechazo
 * para items en estado pending_review.
 */
export function SyncCenterPendingTable({ statusFilter = null }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listSyncItems({ status: statusFilter, limit: 100 });
      setItems(rows);
    } catch (err) {
      setError(err?.message ?? "Error al cargar items de sync.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="mt-6 rounded-xl border border-[--color-desktop-border] bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Items de sincronización
          {items.length > 0 && (
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {items.length}
            </span>
          )}
        </h3>
        <button
          type="button"
          disabled={loading}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          onClick={load}
        >
          {loading ? "Cargando…" : "Actualizar"}
        </button>
      </div>

      {error && (
        <p className="px-5 py-3 text-sm text-rose-600">{error}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Entidad</th>
              <th className="px-4 py-3">ID entidad</th>
              <th className="px-4 py-3">Operación</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Aprobación</th>
              <th className="px-4 py-3">Intentos</th>
              <th className="px-4 py-3">Creado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {!loading && items.length === 0 && <EmptyState />}
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs text-slate-700">
                  {item.entity}
                </td>
                <td className="max-w-[8rem] truncate px-4 py-3 font-mono text-xs text-slate-500">
                  {item.entityId ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs text-slate-700">
                  {item.operation}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={item.status} />
                </td>
                <td className="px-4 py-3">
                  <ApprovalBadge value={item.approvalStatus} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {item.attempts ?? 0}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <RowActions item={item} onRefresh={load} />
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                  Cargando…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
