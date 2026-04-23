import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/auth.store';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useApiError } from '@/hooks/useApiError';
import {
  fetchInstalledModules,
  fetchModuleCatalog,
  fetchModuleJob,
  installModule,
  uninstallModule,
  upgradeModule,
} from '../api/module-store.api';

const LOCAL_QUEUE_KEY = 'atlas-module-store-queue-v1';

function parseVersion(version) {
  const [major = 0, minor = 0, patch = 0] = String(version ?? '')
    .split('.')
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
  const versions = Array.isArray(moduleDefinition?.versions) ? [...moduleDefinition.versions] : [];
  versions.sort((a, b) => compareSemver(b.version, a.version));
  return versions[0]?.version ?? null;
}

function getUpgradeTarget(moduleDefinition, currentVersion) {
  const versions = Array.isArray(moduleDefinition?.versions) ? [...moduleDefinition.versions] : [];
  versions.sort((a, b) => compareSemver(b.version, a.version));
  return versions.find((row) => compareSemver(row.version, currentVersion) > 0)?.version ?? null;
}

function buildRequestId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function readLocalQueue() {
  try {
    const raw = localStorage.getItem(LOCAL_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalQueue(queue) {
  localStorage.setItem(LOCAL_QUEUE_KEY, JSON.stringify(queue));
}

function normalizeModules(catalog, installed) {
  const installedByKey = new Map((installed ?? []).map((row) => [row.moduleKey, row]));
  return (catalog ?? []).map((moduleDefinition) => ({
    ...moduleDefinition,
    installation: installedByKey.get(moduleDefinition.moduleKey) ?? null,
  }));
}

export default function ModuleStorePage() {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();
  const user = useAuthStore((state) => state.user);
  const organizationId = user?.organizationId;
  const isOnline = useOnlineStatus();
  const { pendingCount } = useSyncStatus();

  const [search, setSearch] = useState('');
  const [selectedModuleKey, setSelectedModuleKey] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);
  const [localQueue, setLocalQueue] = useState(() => readLocalQueue());
  const [isFlushingQueue, setIsFlushingQueue] = useState(false);

  const {
    data: catalog = [],
    isLoading: isLoadingCatalog,
    isError: isCatalogError,
    error: catalogError,
    refetch: refetchCatalog,
  } = useQuery({
    queryKey: ['module-store-catalog'],
    queryFn: () => fetchModuleCatalog({ includeDeprecated: false }),
  });

  const {
    data: installed = [],
    isLoading: isLoadingInstalled,
    isError: isInstalledError,
    error: installedError,
    refetch: refetchInstalled,
  } = useQuery({
    queryKey: ['module-store-installed', organizationId],
    queryFn: fetchInstalledModules,
    enabled: Boolean(organizationId),
  });

  const modules = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = normalizeModules(catalog, installed);
    if (!q) return rows;
    return rows.filter((row) => {
      const haystack = [row.name, row.moduleKey, row.description].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [catalog, installed, search]);

  useEffect(() => {
    if (!modules.length) {
      setSelectedModuleKey(null);
      return;
    }
    const stillExists = modules.some((row) => row.moduleKey === selectedModuleKey);
    if (!selectedModuleKey || !stillExists) {
      setSelectedModuleKey(modules[0].moduleKey);
    }
  }, [modules, selectedModuleKey]);

  const selectedModule = useMemo(
    () => modules.find((row) => row.moduleKey === selectedModuleKey) ?? null,
    [modules, selectedModuleKey],
  );

  const installMutation = useMutation({
    mutationFn: installModule,
  });
  const uninstallMutation = useMutation({
    mutationFn: uninstallModule,
  });
  const upgradeMutation = useMutation({
    mutationFn: upgradeModule,
  });

  const currentJobQuery = useQuery({
    queryKey: ['module-store-job', activeJobId],
    queryFn: () => fetchModuleJob(activeJobId),
    enabled: Boolean(activeJobId) && isOnline,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'RUNNING' || status === 'PENDING' ? 1500 : false;
    },
  });

  useEffect(() => {
    if (isCatalogError) handleError(catalogError);
  }, [catalogError, handleError, isCatalogError]);

  useEffect(() => {
    if (isInstalledError) handleError(installedError);
  }, [installedError, handleError, isInstalledError]);

  useEffect(() => {
    const status = currentJobQuery.data?.status;
    if (!status) return;

    if (status === 'COMPLETED') {
      void queryClient.invalidateQueries({ queryKey: ['module-store-installed'] });
      void queryClient.invalidateQueries({ queryKey: ['module-store-catalog'] });
      setActiveJobId(null);
    }

    if (status === 'FAILED' || status === 'ROLLED_BACK') {
      handleError(new Error(`Job Module Store fallo con estado ${status}.`));
      setActiveJobId(null);
    }
  }, [currentJobQuery.data?.status, handleError, queryClient]);

  const executeOnlineOperation = useCallback(
    async (queuedOperation) => {
      if (queuedOperation.type === 'install') {
        const job = await installMutation.mutateAsync(queuedOperation.payload);
        setActiveJobId(job?.id ?? null);
        return job;
      }
      if (queuedOperation.type === 'uninstall') {
        const job = await uninstallMutation.mutateAsync(queuedOperation.payload);
        setActiveJobId(job?.id ?? null);
        return job;
      }
      if (queuedOperation.type === 'upgrade') {
        const job = await upgradeMutation.mutateAsync(queuedOperation.payload);
        setActiveJobId(job?.id ?? null);
        return job;
      }
      throw new Error(`Operacion no soportada: ${queuedOperation.type}`);
    },
    [installMutation, uninstallMutation, upgradeMutation],
  );

  useEffect(() => {
    if (!isOnline || localQueue.length === 0 || isFlushingQueue) return;

    const nextOperation = localQueue[0];
    let cancelled = false;

    async function flushNext() {
      try {
        setIsFlushingQueue(true);
        await executeOnlineOperation(nextOperation);
        if (cancelled) return;
        setLocalQueue((prev) => {
          const next = prev.slice(1);
          writeLocalQueue(next);
          return next;
        });
      } catch (error) {
        if (!cancelled) {
          handleError(error, 'No se pudo sincronizar una operacion pendiente de Module Store.');
        }
      } finally {
        if (!cancelled) {
          setIsFlushingQueue(false);
        }
      }
    }

    void flushNext();
    return () => {
      cancelled = true;
    };
  }, [executeOnlineOperation, handleError, isFlushingQueue, isOnline, localQueue]);

  const queueOperation = useCallback((operation) => {
    setLocalQueue((prev) => {
      const next = [...prev, operation];
      writeLocalQueue(next);
      return next;
    });
  }, []);

  const submitOperation = useCallback(
    async (operation) => {
      if (!organizationId) {
        handleError(new Error('No hay organizationId en sesion para ejecutar la operacion.'));
        return;
      }
      if (!isOnline) {
        queueOperation(operation);
        return;
      }

      try {
        await executeOnlineOperation(operation);
        await queryClient.invalidateQueries({ queryKey: ['module-store-installed'] });
        await queryClient.invalidateQueries({ queryKey: ['module-store-catalog'] });
      } catch (error) {
        handleError(error);
      }
    },
    [executeOnlineOperation, handleError, isOnline, organizationId, queryClient, queueOperation],
  );

  const busy =
    installMutation.isPending ||
    uninstallMutation.isPending ||
    upgradeMutation.isPending ||
    isFlushingQueue;
  const canOperate = Boolean(organizationId);

  const syncPendingTotal = pendingCount + localQueue.length;
  const selectedInstallation = selectedModule?.installation ?? null;
  const latestVersion = selectedModule ? getLatestVersion(selectedModule) : null;
  const upgradeTarget =
    selectedModule && selectedInstallation?.version
      ? getUpgradeTarget(selectedModule, selectedInstallation.version)
      : null;

  const isLoading = isLoadingCatalog || isLoadingInstalled;
  const isError = isCatalogError || isInstalledError;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Module Store</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Instala, desinstala y actualiza modulos por instancia.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip tone={isOnline ? 'green' : 'amber'}>
            {isOnline ? 'Online' : 'Offline'}
          </StatusChip>
          <StatusChip tone={syncPendingTotal > 0 ? 'amber' : 'slate'}>
            Sync-pending: {syncPendingTotal}
          </StatusChip>
          {currentJobQuery.data?.status ? (
            <StatusChip tone={currentJobQuery.data.status === 'COMPLETED' ? 'green' : 'blue'}>
              Job: {currentJobQuery.data.status}
            </StatusChip>
          ) : null}
        </div>
      </header>

      {!isOnline ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Sin conexion: las operaciones se encolan localmente y se sincronizan al reconectar.
        </div>
      ) : null}

      {localQueue.length > 0 ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Operaciones de tienda pendientes: {localQueue.length}.
        </div>
      ) : null}

      {!canOperate ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No se detecta organizationId en la sesion actual.
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-surface p-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar modulo por nombre, key o descripcion..."
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
        />
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-border bg-surface px-6 py-8 text-center text-sm text-text-secondary">
          Cargando catalogo e instalaciones...
        </div>
      ) : null}

      {!isLoading && isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-6 text-sm text-red-700">
          <p>No se pudo cargar Module Store.</p>
          <button
            type="button"
            onClick={() => {
              void refetchCatalog();
              void refetchInstalled();
            }}
            className="mt-3 rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold"
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && modules.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-6 py-8 text-center text-sm text-text-secondary">
          No hay modulos para mostrar con el filtro actual.
        </div>
      ) : null}

      {!isLoading && !isError && modules.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <section className="rounded-lg border border-border bg-surface p-3">
            <h2 className="mb-2 text-sm font-semibold text-text-primary">Catalogo</h2>
            <div className="space-y-2">
              {modules.map((moduleDefinition) => {
                const installedStatus = moduleDefinition.installation?.status ?? 'NOT_INSTALLED';
                const active = moduleDefinition.moduleKey === selectedModuleKey;
                return (
                  <button
                    key={moduleDefinition.moduleKey}
                    type="button"
                    onClick={() => setSelectedModuleKey(moduleDefinition.moduleKey)}
                    className={[
                      'w-full rounded-lg border px-3 py-2 text-left transition-colors',
                      active
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-border bg-white hover:bg-surface-subtle',
                    ].join(' ')}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary">
                        {moduleDefinition.name}
                      </p>
                      {moduleDefinition.isCore ? <StatusChip tone="slate">Core</StatusChip> : null}
                      <StatusChip tone={installedStatus === 'INSTALLED' ? 'green' : 'slate'}>
                        {installedStatus}
                      </StatusChip>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">{moduleDefinition.moduleKey}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface p-4">
            {selectedModule ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary">
                      {selectedModule.name}
                    </h2>
                    <p className="mt-1 text-sm text-text-secondary">{selectedModule.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusChip tone={selectedModule.isCore ? 'slate' : 'blue'}>
                      {selectedModule.isCore ? 'Core obligatorio' : 'Instalable'}
                    </StatusChip>
                    <StatusChip tone="slate">Lifecycle: {selectedModule.lifecycleState}</StatusChip>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-3 rounded-lg bg-surface-subtle p-3 text-sm md:grid-cols-2">
                  <InfoRow
                    label="Version instalada"
                    value={selectedInstallation?.version ?? 'No instalada'}
                  />
                  <InfoRow label="Ultima version" value={latestVersion ?? 'No disponible'} />
                  <InfoRow
                    label="Estado actual"
                    value={selectedInstallation?.status ?? 'NOT_INSTALLED'}
                  />
                  <InfoRow
                    label="Dependencias hard"
                    value={selectedModule.dependencies?.length ?? 0}
                  />
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  {!selectedInstallation || selectedInstallation.status === 'DISABLED' ? (
                    <button
                      type="button"
                      disabled={busy || !latestVersion || !canOperate}
                      onClick={() =>
                        void submitOperation({
                          type: 'install',
                          payload: {
                            organizationId,
                            moduleKey: selectedModule.moduleKey,
                            version: latestVersion,
                            requestId: buildRequestId('module-install'),
                          },
                        })
                      }
                      className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Instalar
                    </button>
                  ) : null}

                  {selectedInstallation?.status === 'INSTALLED' && upgradeTarget ? (
                    <button
                      type="button"
                      disabled={busy || !canOperate}
                      onClick={() =>
                        void submitOperation({
                          type: 'upgrade',
                          payload: {
                            organizationId,
                            moduleKey: selectedModule.moduleKey,
                            fromVersion: selectedInstallation.version,
                            toVersion: upgradeTarget,
                            requestId: buildRequestId('module-upgrade'),
                          },
                        })
                      }
                      className="rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Upgrade a {upgradeTarget}
                    </button>
                  ) : null}

                  {selectedInstallation?.status === 'INSTALLED' && !selectedModule.isCore ? (
                    <button
                      type="button"
                      disabled={busy || !canOperate}
                      onClick={() =>
                        void submitOperation({
                          type: 'uninstall',
                          payload: {
                            organizationId,
                            moduleKey: selectedModule.moduleKey,
                            requestId: buildRequestId('module-uninstall'),
                          },
                        })
                      }
                      className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Desinstalar (disable only)
                    </button>
                  ) : null}

                  {selectedModule.isCore ? (
                    <p className="self-center text-xs text-text-secondary">
                      Core no es desinstalable.
                    </p>
                  ) : null}
                </div>

                {Array.isArray(selectedModule.versions) && selectedModule.versions.length > 0 ? (
                  <div className="mt-5">
                    <h3 className="text-sm font-semibold text-text-primary">
                      Versiones disponibles
                    </h3>
                    <ul className="mt-2 space-y-1 text-xs text-text-secondary">
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
          </section>
        </div>
      ) : null}
    </div>
  );
}

function StatusChip({ children, tone = 'slate' }) {
  const toneClass = {
    slate: 'border-slate-300 bg-slate-100 text-slate-700',
    blue: 'border-blue-300 bg-blue-100 text-blue-700',
    green: 'border-emerald-300 bg-emerald-100 text-emerald-700',
    amber: 'border-amber-300 bg-amber-100 text-amber-700',
  };

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        toneClass[tone] ?? toneClass.slate,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-text-secondary">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-text-primary">{value}</dd>
    </div>
  );
}
