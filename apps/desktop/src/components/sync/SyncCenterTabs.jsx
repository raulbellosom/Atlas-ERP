import { useCallback, useEffect, useState } from "react";
import { listSyncItems } from "../../modules/sync/localSyncItemsRepository.js";
import { SyncCenterPendingTable } from "./SyncCenterPendingTable.jsx";
import { ConflictDetailPanel } from "./ConflictDetailPanel.jsx";
import {
  canResolveSyncConflicts,
  getSyncConflictPermissionMessage,
} from "../../modules/sync/conflictPermissions.js";

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

function StatusBadge({ value }) {
  const tones = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    done: "bg-emerald-100 text-emerald-700",
    failed: "bg-rose-100 text-rose-700",
    canceled: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[value] || "bg-slate-100 text-slate-600"}`}>
      {value}
    </span>
  );
}

// ─── Generic read-only table ──────────────────────────────────────────────────

function ReadOnlyTable({ columns, items, loading, emptyText, onRowClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-500">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {loading && (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-xs text-slate-400">
                Cargando…
              </td>
            </tr>
          )}
          {!loading && items.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-10 text-center text-sm text-slate-400">
                {emptyText}
              </td>
            </tr>
          )}
          {!loading &&
            items.map((item, idx) => (
              <tr
                key={item.id ?? idx}
                className={`transition-colors ${onRowClick ? "cursor-pointer hover:bg-slate-50" : "hover:bg-slate-50"}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render ? col.render(item) : <span className="text-xs text-slate-700">{item[col.key] ?? "—"}</span>}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Section: Sincronizados (T-1030) ─────────────────────────────────────────

function SyncedSection({ reloadToken = 0 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listSyncItems({ status: "done", limit: 100 });
      setItems(rows);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, reloadToken]);

  const columns = [
    { key: "entity", header: "Entidad", render: (r) => <span className="font-mono text-xs text-slate-700">{r.entity}</span> },
    { key: "entityId", header: "ID entidad", render: (r) => <span className="max-w-[7rem] truncate block font-mono text-xs text-slate-500">{r.entityId ?? "—"}</span> },
    { key: "operation", header: "Operacion", render: (r) => <span className="text-xs text-slate-700">{r.operation}</span> },
    { key: "attempts", header: "Intentos", render: (r) => <span className="text-xs text-slate-600">{r.attempts ?? 0}</span> },
    { key: "createdAt", header: "Creado", render: (r) => <span className="text-xs text-slate-500">{formatDate(r.createdAt)}</span> },
    { key: "updatedAt", header: "Sincronizado", render: (r) => <span className="text-xs text-slate-500">{formatDate(r.updatedAt)}</span> },
  ];

  return (
    <SectionWrapper
      title="Sincronizados"
      count={items.length}
      onRefresh={load}
      loading={loading}
    >
      <ReadOnlyTable
        columns={columns}
        items={items}
        loading={loading}
        emptyText="No hay items sincronizados aun."
      />
    </SectionWrapper>
  );
}

// ─── Section: Rechazados (T-1031) ─────────────────────────────────────────────

function RejectedSection({ reloadToken = 0 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await listSyncItems({ limit: 200 });
      // Filtra localmente: rechazados por aprobacion O cancelados
      const rejected = all.filter(
        (r) => r.approvalStatus === "rejected" || r.status === "canceled",
      );
      setItems(rejected);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, reloadToken]);

  const columns = [
    { key: "entity", header: "Entidad", render: (r) => <span className="font-mono text-xs text-slate-700">{r.entity}</span> },
    { key: "entityId", header: "ID entidad", render: (r) => <span className="max-w-[7rem] truncate block font-mono text-xs text-slate-500">{r.entityId ?? "—"}</span> },
    { key: "operation", header: "Operacion", render: (r) => <span className="text-xs text-slate-700">{r.operation}</span> },
    {
      key: "approvalReason",
      header: "Motivo de rechazo",
      render: (r) => <span className="max-w-[14rem] truncate block text-xs text-slate-600">{r.approvalReason ?? "—"}</span>,
    },
    { key: "createdAt", header: "Creado", render: (r) => <span className="text-xs text-slate-500">{formatDate(r.createdAt)}</span> },
  ];

  return (
    <SectionWrapper
      title="Rechazados"
      count={items.length}
      onRefresh={load}
      loading={loading}
    >
      <ReadOnlyTable
        columns={columns}
        items={items}
        loading={loading}
        emptyText="No hay items rechazados."
      />
    </SectionWrapper>
  );
}

// ─── Section: Conflictos (T-1032) ─────────────────────────────────────────────

function ConflictsSection({
  onSelectItem,
  reloadToken = 0,
  canResolve = false,
  permissionMessage = "",
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const failed = await listSyncItems({ status: "failed", limit: 100 });
      // Items marcados como fallidos por conflicto del backend
      const conflicts = failed.filter(
        (r) => r.lastError?.toLowerCase().includes("conflict"),
      );
      setItems(conflicts);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, reloadToken]);

  const columns = [
    { key: "entity", header: "Entidad", render: (r) => <span className="font-mono text-xs text-slate-700">{r.entity}</span> },
    { key: "entityId", header: "ID entidad", render: (r) => <span className="max-w-[7rem] truncate block font-mono text-xs text-slate-500">{r.entityId ?? "—"}</span> },
    { key: "operation", header: "Operacion", render: (r) => <span className="text-xs text-slate-700">{r.operation}</span> },
    { key: "attempts", header: "Intentos", render: (r) => <span className="text-xs text-slate-600">{r.attempts ?? 0}</span> },
    {
      key: "lastError",
      header: "Error",
      render: (r) => (
        <span className="max-w-[16rem] truncate block text-xs text-rose-600">
          {r.lastError ?? "—"}
        </span>
      ),
    },
    { key: "createdAt", header: "Creado", render: (r) => <span className="text-xs text-slate-500">{formatDate(r.createdAt)}</span> },
    {
      key: "_actions",
      header: "",
      render: (r) => (
        <button
          type="button"
          className="rounded px-2 py-0.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
          onClick={(e) => { e.stopPropagation(); onSelectItem(r); }}
        >
          Ver detalle
        </button>
      ),
    },
  ];

  return (
    <SectionWrapper
      title="Conflictos"
      count={items.length}
      onRefresh={load}
      loading={loading}
      countTone="rose"
    >
      {items.length > 0 && (
        <p className="border-b border-slate-100 px-5 py-2 text-xs text-slate-500">
          Items marcados como fallidos por conflicto en el backend. Haz clic en &quot;Ver detalle&quot; para inspeccionar el payload.
        </p>
      )}
      {!canResolve && (
        <p className="border-b border-amber-100 bg-amber-50 px-5 py-2 text-xs text-amber-700">
          {permissionMessage || "Sin permisos para resolver conflictos."}
        </p>
      )}
      <ReadOnlyTable
        columns={columns}
        items={items}
        loading={loading}
        emptyText="No hay conflictos detectados en esta sesion."
        onRowClick={onSelectItem}
      />
    </SectionWrapper>
  );
}

// ─── Section: Historial (T-1033) ──────────────────────────────────────────────

function HistorySection({ onSelectItem, reloadToken = 0 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await listSyncItems({ limit: 200 });
      setItems(all);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, reloadToken]);

  const columns = [
    { key: "entity", header: "Entidad", render: (r) => <span className="font-mono text-xs text-slate-700">{r.entity}</span> },
    { key: "entityId", header: "ID entidad", render: (r) => <span className="max-w-[7rem] truncate block font-mono text-xs text-slate-500">{r.entityId ?? "—"}</span> },
    { key: "operation", header: "Operacion", render: (r) => <span className="text-xs">{r.operation}</span> },
    {
      key: "status",
      header: "Estado",
      render: (r) => <StatusBadge value={r.status} />,
    },
    {
      key: "approvalStatus",
      header: "Aprobacion",
      render: (r) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          r.approvalStatus === "approved"
            ? "bg-emerald-100 text-emerald-700"
            : r.approvalStatus === "rejected"
            ? "bg-rose-100 text-rose-700"
            : "bg-amber-100 text-amber-700"
        }`}>
          {r.approvalStatus ?? "—"}
        </span>
      ),
    },
    { key: "attempts", header: "Intentos", render: (r) => <span className="text-xs text-slate-600">{r.attempts ?? 0}</span> },
    { key: "createdAt", header: "Creado", render: (r) => <span className="text-xs text-slate-500">{formatDate(r.createdAt)}</span> },
    {
      key: "_detail",
      header: "",
      render: (r) => (
        <button
          type="button"
          className="rounded px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
          onClick={(e) => { e.stopPropagation(); onSelectItem(r); }}
        >
          Detalle
        </button>
      ),
    },
  ];

  return (
    <SectionWrapper
      title="Historial completo"
      count={items.length}
      onRefresh={load}
      loading={loading}
    >
      <ReadOnlyTable
        columns={columns}
        items={items}
        loading={loading}
        emptyText="No hay items de sincronizacion registrados."
        onRowClick={onSelectItem}
      />
    </SectionWrapper>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function SectionWrapper({ title, count, onRefresh, loading, children, countTone = "slate" }) {
  const countClass =
    countTone === "rose"
      ? "bg-rose-100 text-rose-600"
      : "bg-slate-100 text-slate-600";

  return (
    <div className="rounded-xl border border-[--color-desktop-border] bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <h3 className="text-sm font-semibold text-slate-900">
          {title}
          {count > 0 && (
            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${countClass}`}>
              {count}
            </span>
          )}
        </h3>
        <button
          type="button"
          disabled={loading}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          onClick={onRefresh}
        >
          {loading ? "Cargando…" : "Actualizar"}
        </button>
      </div>
      {children}
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: "pendientes", label: "Pendientes" },
  { id: "sincronizados", label: "Sincronizados" },
  { id: "rechazados", label: "Rechazados" },
  { id: "conflictos", label: "Conflictos" },
  { id: "historial", label: "Historial" },
];

// ─── Main exported component ──────────────────────────────────────────────────

/**
 * T-1030 a T-1033: Centro de sincronizacion desktop con 5 tabs.
 * Cada tab carga su propia seccion de datos desde SQLite local.
 */
export function SyncCenterTabs({ session = null }) {
  const [activeTab, setActiveTab] = useState("pendientes");
  const [selectedItem, setSelectedItem] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const canResolveConflicts = canResolveSyncConflicts(session);
  const permissionMessage = getSyncConflictPermissionMessage(session);

  function handleConflictResolved() {
    setSelectedItem(null);
    setReloadToken((prev) => prev + 1);
  }

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-base font-semibold text-slate-900">Sync Center</h2>

      {/* Tab bar */}
      <div className="mb-4 flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "pendientes" && <SyncCenterPendingTable />}
      {activeTab === "sincronizados" && <SyncedSection reloadToken={reloadToken} />}
      {activeTab === "rechazados" && <RejectedSection reloadToken={reloadToken} />}
      {activeTab === "conflictos" && (
        <ConflictsSection
          onSelectItem={setSelectedItem}
          reloadToken={reloadToken}
          canResolve={canResolveConflicts}
          permissionMessage={permissionMessage}
        />
      )}
      {activeTab === "historial" && <HistorySection onSelectItem={setSelectedItem} reloadToken={reloadToken} />}

      {/* T-1034: Conflict detail panel */}
      <ConflictDetailPanel
        item={selectedItem}
        canResolve={canResolveConflicts}
        permissionMessage={permissionMessage}
        onClose={() => setSelectedItem(null)}
        onResolved={handleConflictResolved}
      />
    </section>
  );
}
