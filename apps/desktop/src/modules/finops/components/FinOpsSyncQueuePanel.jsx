/**
 * FinOpsSyncQueuePanel — panel lateral de cola de sync del módulo FinOps.
 *
 * Muestra los ítems pendientes de sincronización con acciones de
 * reintento y descarte. Se integra como sidebar colapsable en el layout FinOps.
 *
 * Task origen: T-1510 (Fase 15 Bloque 3)
 */

import { useState } from "react";
import { sqliteExecute } from "../../../bridge/sqlite.bridge.js";
import { useFinOpsSyncQueue } from "../hooks/useFinOpsSyncQueue.js";

const ENTITY_LABELS = {
  financial_movement: "Movimiento",
  financial_transfer: "Transferencia",
  receivable: "CxC",
  payable: "CxP",
};

const STATUS_CONFIG = {
  pending: { label: "Pendiente", className: "bg-amber-100 text-amber-700" },
  processing: { label: "Procesando", className: "bg-blue-100 text-blue-700" },
  failed: { label: "Error", className: "bg-rose-100 text-rose-700" },
  done: { label: "Listo", className: "bg-emerald-100 text-emerald-700" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function SyncItem({ item, onDiscard, onRetry }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-slate-800">
            {ENTITY_LABELS[item.entity] ?? item.entity} — {item.operation}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{item.entityId}</p>
          {item.lastError && (
            <p className="mt-1 text-xs text-rose-600">{item.lastError}</p>
          )}
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-slate-400">{item.attempts} intento{item.attempts !== 1 ? "s" : ""}</span>
        {item.status === "failed" && (
          <button
            type="button"
            onClick={() => onRetry(item)}
            className="rounded-md border border-blue-200 px-2 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
          >
            Reintentar
          </button>
        )}
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="ml-auto rounded-md border border-rose-200 px-2 py-0.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
          >
            Descartar
          </button>
        ) : (
          <div className="ml-auto flex gap-1">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-500"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onDiscard(item)}
              className="rounded-md bg-rose-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-rose-700"
            >
              Confirmar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function FinOpsSyncQueuePanel({ collapsed = false, onToggle }) {
  const { items, loading, pendingCount, errorCount, refetch } = useFinOpsSyncQueue();

  async function handleDiscard(item) {
    await sqliteExecute(
      `DELETE FROM sync_queue_items WHERE id = ?1`,
      [item.id],
    );
    refetch();
  }

  async function handleRetry(item) {
    await sqliteExecute(
      `UPDATE sync_queue_items SET status = 'pending', attempts = 0, last_error = NULL, updated_at = ?1 WHERE id = ?2`,
      [new Date().toISOString(), item.id],
    );
    refetch();
  }

  const totalBadge = pendingCount + errorCount;

  return (
    <div className={`flex flex-col border-l border-slate-200 bg-slate-50 transition-all ${collapsed ? "w-10" : "w-72"}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between border-b border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
      >
        <span className={collapsed ? "hidden" : ""}>Cola de sync FinOps</span>
        {totalBadge > 0 && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-bold text-white">
            {totalBadge}
          </span>
        )}
        <span>{collapsed ? "→" : "←"}</span>
      </button>

      {!collapsed && (
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {loading ? (
            <p className="text-xs text-slate-400">Cargando…</p>
          ) : items.length === 0 ? (
            <p className="text-xs text-slate-400">Sin ítems pendientes.</p>
          ) : (
            items.map((item) => (
              <SyncItem
                key={item.id}
                item={item}
                onDiscard={handleDiscard}
                onRetry={handleRetry}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
