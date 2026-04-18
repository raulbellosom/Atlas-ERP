import { useState } from "react";
import { getRuntimeLabel } from "./bridge/tauri.js";
import { LocalSyncStatusPanel } from "./components/sync/LocalSyncStatusPanel.jsx";
import { SyncCenterTabs } from "./components/sync/SyncCenterTabs.jsx";
import { env } from "./config/env.js";
import { useDesktopBootstrap } from "./hooks/useDesktopBootstrap.js";

function BootBadge({ mode }) {
  const toneByMode = {
    initializing: "bg-slate-100 text-slate-700",
    authenticated: "bg-emerald-100 text-emerald-700",
    offline: "bg-amber-100 text-amber-700",
    guest: "bg-blue-100 text-blue-700",
    error: "bg-rose-100 text-rose-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${toneByMode[mode] || toneByMode.guest}`}>
      {mode}
    </span>
  );
}

function formatMigrationInfo(migrations, applied) {
  if (!Array.isArray(migrations) || !Array.isArray(applied)) {
    return "pendiente";
  }

  return `${migrations.length} instaladas (${applied.length} aplicadas en arranque)`;
}

function buildFakeSession() {
  const now = Date.now();
  return {
    accessToken: "desktop-local-access-token",
    refreshToken: "desktop-local-refresh-token",
    expiresAt: new Date(now + 8 * 60 * 60 * 1000).toISOString(),
    allowOffline: true,
    user: {
      id: "local-user-demo",
      email: "operador@atlaserp.local",
      fullName: "Operador Local AtlasERP",
      role: "admin",
    },
  };
}

function buildDemoSyncItemDraft() {
  return {
    entity: "setting",
    entityId: "ui.language",
    operation: "update",
    payload: {
      value: "es-MX",
      source: "desktop-shell",
    },
    source: "desktop",
    priority: 100,
  };
}

function App() {
  const { state, actions } = useDesktopBootstrap();
  const [enqueueResult, setEnqueueResult] = useState(null);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <main className="mx-auto max-w-4xl rounded-2xl border border-[--color-desktop-border] bg-[--color-desktop-surface] p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[--color-desktop-brand]">
              AtlasERP Desktop
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Shell desktop foundation</h1>
            <p className="mt-3 text-sm text-slate-600">
              Arranque local con sesión desktop, soporte offline y estado de sincronización.
            </p>
          </div>
          <BootBadge mode={state.bootMode} />
        </div>

        <dl className="mt-8 grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 text-sm md:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500">Runtime</dt>
            <dd className="mt-1 text-slate-900">{getRuntimeLabel()}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">API base</dt>
            <dd className="mt-1 text-slate-900">{env.apiUrl}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Ambiente</dt>
            <dd className="mt-1 text-slate-900">{env.environment}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">DB path</dt>
            <dd className="mt-1 truncate text-slate-900">{state.paths?.dbFile || state.paths?.db_file || "pendiente"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Migraciones SQLite</dt>
            <dd className="mt-1 text-slate-900">{formatMigrationInfo(state.migrations, state.appliedMigrations)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Updater</dt>
            <dd className="mt-1 text-slate-900">
              {state.updaterStatus?.channel || "stable"} / {state.updaterCheck?.updateAvailable ? "update disponible" : "sin update"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Sesión local</dt>
            <dd className="mt-1 text-slate-900">{state.session?.user?.email || state.cachedProfile?.email || "sin sesión"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Red</dt>
            <dd className="mt-1 text-slate-900">{state.network?.online ? "online" : "offline"}</dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg bg-[--color-desktop-brand] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            onClick={async () => {
              await actions.persistSession(buildFakeSession());
            }}
          >
            Simular sesión local
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            onClick={async () => {
              await actions.clearSession();
            }}
          >
            Limpiar sesión local
          </button>
          <button
            type="button"
            className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
            onClick={async () => {
              const result = await actions.enqueueSyncItemDraft(buildDemoSyncItemDraft());
              setEnqueueResult(result);
            }}
          >
            Enqueue demo sync item
          </button>
        </div>

        {enqueueResult ? (
          <p className="mt-3 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-700">
            Resultado enqueue: {enqueueResult.accepted ? "aceptado" : "bloqueado"} / aprobación: {enqueueResult.approvalStatus || "n/a"}
            {enqueueResult.duplicated ? " / duplicado detectado" : ""}
          </p>
        ) : null}

        <LocalSyncStatusPanel
          bootMode={state.bootMode}
          queueSummary={state.queueSummary}
          queueRecovered={state.queueRecovered}
          queuePendingCount={state.queuePendingCount}
          syncItemsPendingCount={state.syncItemsPendingCount}
          pendingConflicts={state.pendingConflicts}
          network={state.network}
          updaterStatus={state.updaterStatus}
        />

        <SyncCenterTabs session={state.session} />

        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">Logs locales desktop (últimos)</h3>
          <p className="mt-1 text-xs text-slate-500">Conteo: {Array.isArray(state.recentLogs) ? state.recentLogs.length : 0}</p>
          <div className="mt-3 space-y-2">
            {(state.recentLogs || []).slice(0, 5).map((entry) => (
              <div key={entry.id} className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-700">
                <span className="font-semibold uppercase text-slate-500">{entry.level}</span>{" "}
                <span className="text-slate-400">[{entry.module}]</span>{" "}
                <span>{entry.message}</span>
              </div>
            ))}
          </div>
        </section>

        {state.error ? <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">Error de arranque desktop: {state.error}</p> : null}
      </main>
    </div>
  );
}

export default App;
