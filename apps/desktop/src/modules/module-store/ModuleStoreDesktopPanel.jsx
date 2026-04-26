import { useCallback, useEffect, useMemo, useState } from "react";
import { desktopApiClient } from "../../api/client.js";
import {
  enqueueModuleStoreLifecycleOperation,
  listModuleStoreLifecycleQueue,
} from "./moduleStoreOfflineQueue.js";
import { runModuleStoreLifecycleCycle } from "./moduleStoreLifecycleWorker.js";

function parseVersion(version) {
  const [major = 0, minor = 0, patch = 0] = String(version ?? "")
    .split(".")
    .map((value) => Number.parseInt(value, 10) || 0);
  return { major, minor, patch };
}

function compareSemver(a, b) {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (left.major !== right.major) return left.major - right.major;
  if (left.minor !== right.minor) return left.minor - right.minor;
  return left.patch - right.patch;
}

function getLatestVersion(moduleDefinition) {
  const versions = Array.isArray(moduleDefinition?.versions)
    ? [...moduleDefinition.versions]
    : [];
  versions.sort((a, b) => compareSemver(b.version, a.version));
  return versions[0]?.version ?? null;
}

function getUpgradeTarget(moduleDefinition, currentVersion) {
  const versions = Array.isArray(moduleDefinition?.versions)
    ? [...moduleDefinition.versions]
    : [];
  versions.sort((a, b) => compareSemver(b.version, a.version));
  return (
    versions.find((row) => compareSemver(row.version, currentVersion) > 0)?.version ??
    null
  );
}

function buildRequestId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function unwrapPayload(payload) {
  return payload?.data ?? payload;
}

async function fetchCatalog() {
  const response = await desktopApiClient.get("/v1/module-store/catalog");
  const payload = unwrapPayload(response);
  return Array.isArray(payload) ? payload : [];
}

async function fetchInstalled() {
  const response = await desktopApiClient.get("/v1/module-store/installed");
  const payload = unwrapPayload(response);
  return Array.isArray(payload) ? payload : [];
}

async function performOperation(operation, payload) {
  if (operation === "install") {
    return desktopApiClient.post("/v1/module-store/install", payload);
  }
  if (operation === "uninstall") {
    return desktopApiClient.post("/v1/module-store/uninstall", payload);
  }
  if (operation === "upgrade") {
    return desktopApiClient.post("/v1/module-store/upgrade", payload);
  }
  throw new Error(`Operacion de module-store no soportada: ${operation}`);
}

function mapInstalledByModule(installed) {
  return new Map((installed ?? []).map((row) => [row.moduleKey, row]));
}

export function ModuleStoreDesktopPanel({
  isOnline,
  defaultOrganizationId = "",
  onQueueCountChange,
}) {
  const [organizationId, setOrganizationId] = useState(defaultOrganizationId);
  const [catalog, setCatalog] = useState([]);
  const [installed, setInstalled] = useState([]);
  const [selectedModuleKey, setSelectedModuleKey] = useState(null);
  const [queueItems, setQueueItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState("");
  const [lastJobStatus, setLastJobStatus] = useState("");

  const refreshQueue = useCallback(async () => {
    const moduleStoreItems = await listModuleStoreLifecycleQueue();
    setQueueItems(moduleStoreItems);
    onQueueCountChange?.(moduleStoreItems.length);
  }, [onQueueCountChange]);

  const refreshStore = useCallback(async () => {
    if (!isOnline) return;
    const [catalogRows, installedRows] = await Promise.all([
      fetchCatalog(),
      fetchInstalled(),
    ]);
    setCatalog(catalogRows);
    setInstalled(installedRows);
  }, [isOnline]);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      try {
        setIsLoading(true);
        await refreshQueue();
        if (isOnline) {
          await refreshStore();
        } else {
          setCatalog([]);
          setInstalled([]);
        }
        if (!cancelled) setError("");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [isOnline, refreshQueue, refreshStore]);

  useEffect(() => {
    if (!catalog.length) {
      setSelectedModuleKey(null);
      return;
    }
    if (!selectedModuleKey || !catalog.some((item) => item.moduleKey === selectedModuleKey)) {
      setSelectedModuleKey(catalog[0].moduleKey);
    }
  }, [catalog, selectedModuleKey]);

  const selectedModule = useMemo(
    () => catalog.find((item) => item.moduleKey === selectedModuleKey) ?? null,
    [catalog, selectedModuleKey],
  );
  const installedByModule = useMemo(() => mapInstalledByModule(installed), [installed]);
  const selectedInstallation = selectedModule
    ? installedByModule.get(selectedModule.moduleKey) ?? null
    : null;

  const flushQueuedOperations = useCallback(async () => {
    const summary = await runModuleStoreLifecycleCycle({
      isOnline,
      onOperationCompleted: (_operation, _payload, job) => {
        setLastJobStatus(job?.status ?? "COMPLETED");
      },
    });
    return summary;
  }, [isOnline]);

  useEffect(() => {
    if (!isOnline || queueItems.length === 0 || isWorking) return;
    let cancelled = false;

    async function syncPending() {
      try {
        setIsWorking(true);
        await flushQueuedOperations();
        if (!cancelled) {
          await refreshQueue();
          await refreshStore();
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron procesar operaciones pendientes de Module Store.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsWorking(false);
        }
      }
    }

    void syncPending();
    return () => {
      cancelled = true;
    };
  }, [flushQueuedOperations, isOnline, isWorking, queueItems.length, refreshQueue, refreshStore]);

  const runOperation = useCallback(
    async (operation, payload) => {
      setError("");
      if (!organizationId) {
        setError("OrganizationId requerido para operar Module Store.");
        return;
      }

      const operationPayload = { ...payload, organizationId };

      if (!isOnline) {
        await enqueueModuleStoreLifecycleOperation({
          operation,
          payload: operationPayload,
          priority: 80,
        });
        await refreshQueue();
        return;
      }

      try {
        setIsWorking(true);
        const response = await performOperation(operation, operationPayload);
        const job = unwrapPayload(response);
        setLastJobStatus(job?.status ?? "");
        await refreshStore();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsWorking(false);
      }
    },
    [isOnline, organizationId, refreshQueue, refreshStore],
  );

  const latestVersion = selectedModule ? getLatestVersion(selectedModule) : null;
  const upgradeTarget =
    selectedModule && selectedInstallation?.version
      ? getUpgradeTarget(selectedModule, selectedInstallation.version)
      : null;

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Module Store (Desktop)</h3>
          <p className="mt-1 text-xs text-slate-600">
            Catalogo de modulos por instancia con cola offline de operaciones.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={[
              "rounded-full px-2 py-1 font-semibold",
              isOnline ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
            ].join(" ")}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
          <span className="rounded-full bg-indigo-100 px-2 py-1 font-semibold text-indigo-700">
            Pending: {queueItems.length}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="text-xs font-medium text-slate-600">OrganizationId</label>
        <input
          value={organizationId}
          onChange={(event) => setOrganizationId(event.target.value)}
          className="w-full max-w-md rounded-md border border-slate-300 px-2 py-1.5 text-xs"
          placeholder="org-id"
        />
        <button
          type="button"
          onClick={async () => {
            setError("");
            try {
              setIsLoading(true);
              await refreshQueue();
              await refreshStore();
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            } finally {
              setIsLoading(false);
            }
          }}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Refrescar
        </button>
      </div>

      {!isOnline ? (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Offline: las operaciones se guardan en cola y se envian cuando vuelva la conexion.
        </p>
      ) : null}

      {lastJobStatus ? (
        <p className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-900">
          Ultimo job: {lastJobStatus}
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-600">
          Cargando Module Store...
        </div>
      ) : null}

      {!isLoading && catalog.length === 0 ? (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-600">
          Sin catalogo disponible.
        </div>
      ) : null}

      {!isLoading && catalog.length > 0 ? (
        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="rounded-md border border-slate-200 p-2">
            <ul className="space-y-1">
              {catalog.map((item) => {
                const status = installedByModule.get(item.moduleKey)?.status ?? "NOT_INSTALLED";
                const active = selectedModuleKey === item.moduleKey;
                return (
                  <li key={item.moduleKey}>
                    <button
                      type="button"
                      onClick={() => setSelectedModuleKey(item.moduleKey)}
                      className={[
                        "w-full rounded-md border px-2 py-2 text-left text-xs transition-colors",
                        active
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-slate-200 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="mt-0.5 text-slate-500">{item.moduleKey}</p>
                      <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {status}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-md border border-slate-200 p-3">
            {selectedModule ? (
              <>
                <h4 className="text-sm font-semibold text-slate-900">{selectedModule.name}</h4>
                <p className="mt-1 text-xs text-slate-600">{selectedModule.description}</p>

                <dl className="mt-3 grid grid-cols-1 gap-2 rounded-md bg-slate-50 p-2 text-xs md:grid-cols-2">
                  <Metric label="Estado" value={selectedInstallation?.status ?? "NOT_INSTALLED"} />
                  <Metric label="Instalada" value={selectedInstallation?.version ?? "N/A"} />
                  <Metric label="Ultima" value={latestVersion ?? "N/A"} />
                  <Metric label="Core" value={selectedModule.isCore ? "Si" : "No"} />
                </dl>

                <div className="mt-3 flex flex-wrap gap-2">
                  {!selectedInstallation || selectedInstallation.status === "DISABLED" ? (
                    <button
                      type="button"
                      disabled={!latestVersion || isWorking}
                      onClick={() =>
                        void runOperation("install", {
                          moduleKey: selectedModule.moduleKey,
                          version: latestVersion,
                          requestId: buildRequestId("desktop-module-install"),
                        })
                      }
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Instalar
                    </button>
                  ) : null}

                  {selectedInstallation?.status === "INSTALLED" && upgradeTarget ? (
                    <button
                      type="button"
                      disabled={isWorking}
                      onClick={() =>
                        void runOperation("upgrade", {
                          moduleKey: selectedModule.moduleKey,
                          fromVersion: selectedInstallation.version,
                          toVersion: upgradeTarget,
                          requestId: buildRequestId("desktop-module-upgrade"),
                        })
                      }
                      className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 disabled:opacity-50"
                    >
                      Upgrade {upgradeTarget}
                    </button>
                  ) : null}

                  {selectedInstallation?.status === "INSTALLED" && !selectedModule.isCore ? (
                    <button
                      type="button"
                      disabled={isWorking}
                      onClick={() =>
                        void runOperation("uninstall", {
                          moduleKey: selectedModule.moduleKey,
                          requestId: buildRequestId("desktop-module-uninstall"),
                        })
                      }
                      className="rounded-md border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 disabled:opacity-50"
                    >
                      Desinstalar (disable)
                    </button>
                  ) : null}
                </div>

                {Array.isArray(selectedModule.versions) && selectedModule.versions.length > 0 ? (
                  <div className="mt-3 text-xs text-slate-600">
                    <p className="font-semibold text-slate-700">Versiones</p>
                    <ul className="mt-1 space-y-1">
                      {selectedModule.versions
                        .slice()
                        .sort((a, b) => compareSemver(b.version, a.version))
                        .map((row) => (
                          <li key={`${selectedModule.moduleKey}-${row.version}`}>
                            {row.version} ({row.compatibilityRange})
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-semibold text-slate-800">{value}</dd>
    </div>
  );
}
