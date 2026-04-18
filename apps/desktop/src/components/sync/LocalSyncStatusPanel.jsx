function Badge({ tone = "neutral", children }) {
  const classes = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${classes[tone] || classes.neutral}`}>
      {children}
    </span>
  );
}

export function LocalSyncStatusPanel({
  bootMode,
  queueSummary,
  queueRecovered,
  queuePendingCount,
  syncItemsPendingCount,
  pendingConflicts,
  network,
  updaterStatus,
}) {
  const summary = queueSummary || {
    pending: 0,
    processing: 0,
    failed: 0,
    done: 0,
    total: 0,
  };

  return (
    <section className="mt-8 rounded-xl border border-[--color-desktop-border] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">Estado local de sincronización</h2>
        <div className="flex gap-2">
          <Badge tone={bootMode === "authenticated" ? "success" : bootMode === "offline" ? "warning" : "neutral"}>
            boot: {bootMode}
          </Badge>
          <Badge tone={network?.online ? "success" : "warning"}>
            red: {network?.online ? "online" : "offline"}
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-500">Pendientes</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{summary.pending}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-500">Procesando</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{summary.processing}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-500">Fallidos</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{summary.failed}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-500">Completados</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{summary.done}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-5">
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-slate-500">Recuperados al reinicio</p>
          <p className="mt-1 font-semibold text-slate-900">{queueRecovered}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-slate-500">Pendientes operativos</p>
          <p className="mt-1 font-semibold text-slate-900">{queuePendingCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-slate-500">Items sync v2 pendientes</p>
          <p className="mt-1 font-semibold text-slate-900">{syncItemsPendingCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-slate-500">Canal de actualización</p>
          <p className="mt-1 font-semibold text-slate-900">{updaterStatus?.channel || "stable"}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-slate-500">Conflictos pendientes</p>
          <p className="mt-1 font-semibold text-slate-900">{pendingConflicts}</p>
        </div>
      </div>
    </section>
  );
}
