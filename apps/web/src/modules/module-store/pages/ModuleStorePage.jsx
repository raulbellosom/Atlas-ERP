import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/auth.store';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useApiError } from '@/hooks/useApiError';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SidePanel from '@/components/ui/SidePanel';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import {
  fetchInstalledModules,
  fetchModuleCatalog,
  fetchModuleJob,
  installModule,
  uninstallModule,
  upgradeModule,
} from '../api/module-store.api';
import { useAddVersion, useSetLifecycle } from '../hooks/useModuleStore';
import { INSTALLED_MODULES_QUERY_KEY } from '@/hooks/useInstalledModules';
import { getModuleMeta } from '@/modules/module-store/constants/module-manifest';

const LOCAL_QUEUE_KEY = 'atlas-module-store-queue-v1';

function parseVersion(version) {
  const [major = 0, minor = 0, patch = 0] = String(version ?? '')
    .split('.')
    .map((v) => Number.parseInt(v, 10) || 0);
  return { major, minor, patch };
}

function compareSemver(a, b) {
  const l = parseVersion(a);
  const r = parseVersion(b);
  if (l.major !== r.major) return l.major - r.major;
  if (l.minor !== r.minor) return l.minor - r.minor;
  return l.patch - r.patch;
}

function getLatestVersion(mod) {
  const versions = Array.isArray(mod?.versions) ? [...mod.versions] : [];
  versions.sort((a, b) => compareSemver(b.version, a.version));
  return versions[0]?.version ?? null;
}

function getUpgradeTarget(mod, currentVersion) {
  const versions = Array.isArray(mod?.versions) ? [...mod.versions] : [];
  versions.sort((a, b) => compareSemver(b.version, a.version));
  return versions.find((v) => compareSemver(v.version, currentVersion) > 0)?.version ?? null;
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
  const byKey = new Map((installed ?? []).map((row) => [row.moduleKey, row]));
  return (catalog ?? []).map((mod) => ({ ...mod, installation: byKey.get(mod.moduleKey) ?? null }));
}

export default function ModuleStorePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { handleError } = useApiError();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const isOnline = useOnlineStatus();
  const { pendingCount } = useSyncStatus();
  const { hasAny } = usePermissions();
  const isStoreAdmin = hasAny('module_store:admin');

  const [search, setSearch] = useState('');
  const [selectedModuleKey, setSelectedModuleKey] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);
  const [localQueue, setLocalQueue] = useState(() => readLocalQueue());
  const [isFlushingQueue, setIsFlushingQueue] = useState(false);

  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [adminLifecycle, setAdminLifecycle] = useState('');
  const [newVersion, setNewVersion] = useState('');
  const [newCompatRange, setNewCompatRange] = useState('');
  const [newChecksum, setNewChecksum] = useState('');

  const setLifecycleMutation = useSetLifecycle();
  const addVersionMutation = useAddVersion();

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
    queryKey: INSTALLED_MODULES_QUERY_KEY,
    queryFn: fetchInstalledModules,
    enabled: Boolean(organizationId),
  });

  const modules = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = normalizeModules(catalog, installed);
    if (!q) return rows;
    return rows.filter((row) =>
      [row.name, row.moduleKey, row.description].join(' ').toLowerCase().includes(q),
    );
  }, [catalog, installed, search]);

  useEffect(() => {
    if (!modules.length) {
      setSelectedModuleKey(null);
      return;
    }
    const stillExists = modules.some((row) => row.moduleKey === selectedModuleKey);
    if (!selectedModuleKey || !stillExists) setSelectedModuleKey(modules[0].moduleKey);
  }, [modules, selectedModuleKey]);

  const selectedModule = useMemo(
    () => modules.find((row) => row.moduleKey === selectedModuleKey) ?? null,
    [modules, selectedModuleKey],
  );
  const selectedModuleLifecycleState = selectedModule?.lifecycleState ?? null;

  useEffect(() => {
    if (selectedModuleLifecycleState) {
      setAdminLifecycle(selectedModuleLifecycleState);
    }
  }, [selectedModuleLifecycleState]);

  const handleSaveLifecycle = useCallback(async () => {
    if (!selectedModule) return;
    try {
      await setLifecycleMutation.mutateAsync({
        moduleKey: selectedModule.moduleKey,
        lifecycleState: adminLifecycle,
      });
      toast.success('Lifecycle actualizado.');
    } catch (err) {
      handleError(err);
    }
  }, [adminLifecycle, handleError, selectedModule, setLifecycleMutation, toast]);

  const handleAddVersion = useCallback(async () => {
    if (!selectedModule || !newVersion.trim()) return;
    try {
      await addVersionMutation.mutateAsync({
        moduleKey: selectedModule.moduleKey,
        version: newVersion.trim(),
        compatibilityRange: newCompatRange.trim() || '>=1.0.0',
        manifestChecksum: newChecksum.trim() || 'manual',
      });
      toast.success(`Versión ${newVersion.trim()} agregada.`);
      setNewVersion('');
      setNewCompatRange('');
      setNewChecksum('');
    } catch (err) {
      handleError(err);
    }
  }, [
    addVersionMutation,
    handleError,
    newChecksum,
    newCompatRange,
    newVersion,
    selectedModule,
    toast,
  ]);

  const installMutation = useMutation({ mutationFn: installModule });
  const uninstallMutation = useMutation({ mutationFn: uninstallModule });
  const upgradeMutation = useMutation({ mutationFn: upgradeModule });

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
      void queryClient.invalidateQueries({ queryKey: INSTALLED_MODULES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['module-store-catalog'] });
      toast.success('Operación completada correctamente.');
      setActiveJobId(null);
    }
    if (status === 'FAILED' || status === 'ROLLED_BACK') {
      handleError(new Error(`Job falló con estado ${status}.`));
      setActiveJobId(null);
    }
  }, [currentJobQuery.data?.status, handleError, queryClient, toast]);

  const executeOnlineOperation = useCallback(
    async (op) => {
      if (op.type === 'install') {
        const job = await installMutation.mutateAsync(op.payload);
        setActiveJobId(job?.id ?? null);
        return job;
      }
      if (op.type === 'uninstall') {
        const job = await uninstallMutation.mutateAsync(op.payload);
        setActiveJobId(job?.id ?? null);
        return job;
      }
      if (op.type === 'upgrade') {
        const job = await upgradeMutation.mutateAsync(op.payload);
        setActiveJobId(job?.id ?? null);
        return job;
      }
      throw new Error(`Operación no soportada: ${op.type}`);
    },
    [installMutation, uninstallMutation, upgradeMutation],
  );

  useEffect(() => {
    if (!isOnline || localQueue.length === 0 || isFlushingQueue) return;
    const next = localQueue[0];
    let cancelled = false;
    async function flushNext() {
      try {
        setIsFlushingQueue(true);
        await executeOnlineOperation(next);
        if (cancelled) return;
        setLocalQueue((prev) => {
          const q = prev.slice(1);
          writeLocalQueue(q);
          return q;
        });
      } catch (err) {
        if (!cancelled) handleError(err, 'No se pudo sincronizar una operación pendiente.');
      } finally {
        if (!cancelled) setIsFlushingQueue(false);
      }
    }
    void flushNext();
    return () => {
      cancelled = true;
    };
  }, [executeOnlineOperation, handleError, isFlushingQueue, isOnline, localQueue]);

  const queueOperation = useCallback((op) => {
    setLocalQueue((prev) => {
      const q = [...prev, op];
      writeLocalQueue(q);
      return q;
    });
  }, []);

  const submitOperation = useCallback(
    async (op) => {
      if (!organizationId) {
        handleError(new Error('No hay organizationId en sesión.'));
        return;
      }
      if (!isOnline) {
        queueOperation(op);
        toast.success('Sin conexión — operación encolada.');
        return;
      }
      try {
        await executeOnlineOperation(op);
        await queryClient.invalidateQueries({ queryKey: INSTALLED_MODULES_QUERY_KEY });
        await queryClient.invalidateQueries({ queryKey: ['module-store-catalog'] });
      } catch (err) {
        handleError(err);
      }
    },
    [
      executeOnlineOperation,
      handleError,
      isOnline,
      organizationId,
      queryClient,
      queueOperation,
      toast,
    ],
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
  const activeJobStatus = currentJobQuery.data?.status;

  const installedKeysSet = useMemo(
    () =>
      new Set((installed ?? []).filter((r) => r.status === 'INSTALLED').map((r) => r.moduleKey)),
    [installed],
  );

  const unmetDeps = useMemo(() => {
    if (!selectedModule?.dependencies?.length) return [];
    return selectedModule.dependencies
      .filter((dep) => dep.isHardDependency !== false)
      .filter((dep) => !installedKeysSet.has(dep.dependsOnModuleKey));
  }, [selectedModule, installedKeysSet]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Module Store"
        description="Instala, desinstala y actualiza módulos por instancia."
        tag={
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? 'success' : 'warning'} size="xs" dot>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            {syncPendingTotal > 0 && (
              <Badge variant="warning" size="xs">
                {syncPendingTotal} pendientes
              </Badge>
            )}
            {activeJobStatus && activeJobStatus !== 'COMPLETED' && (
              <Badge variant="info" size="xs" dot>
                Job: {activeJobStatus}
              </Badge>
            )}
          </div>
        }
      />

      {!isOnline && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Sin conexión — las operaciones se encolan localmente y se sincronizan al reconectar.
        </div>
      )}

      {localQueue.length > 0 && (
        <div className="rounded-xl border border-info-subtle bg-info-subtle px-4 py-3 text-sm text-[oklch(37%_0.130_210)]">
          {localQueue.length} operación(es) pendientes de sincronizar.
        </div>
      )}

      {!canOperate && (
        <div className="rounded-xl border border-error-subtle bg-error-subtle px-4 py-3 text-sm text-[oklch(40%_0.180_27)]">
          No se detecta organización en la sesión actual.
        </div>
      )}

      {/* Search */}
      <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface-subtle">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="text-amber-500 shrink-0"
            aria-hidden="true"
          >
            <path
              d="M1 3h12M3 7h8M5 11h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="label-caps text-[10px]">Búsqueda</span>
        </div>
        <div className="p-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar módulo por nombre, key o descripción..."
            className="w-full sm:w-96"
          />
        </div>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div className="space-y-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-16 rounded-xl border border-border bg-surface animate-pulse"
              />
            ))}
          </div>
          <div className="h-64 rounded-xl border border-border bg-surface animate-pulse" />
        </div>
      )}

      {/* Error state */}
      {!isLoading && isError && (
        <div className="rounded-xl border border-error-subtle bg-error-subtle px-6 py-6 text-sm text-[oklch(40%_0.180_27)]">
          <p className="font-medium">No se pudo cargar el Module Store.</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => {
              void refetchCatalog();
              void refetchInstalled();
            }}
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && modules.length === 0 && (
        <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center text-sm text-text-secondary">
          No hay módulos para mostrar con el filtro actual.
        </div>
      )}

      {/* Master-detail layout */}
      {!isLoading && !isError && modules.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          {/* Catalog list */}
          <section className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface-subtle">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="text-amber-500 shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="label-caps text-[10px]">Catálogo</span>
              <span className="ml-auto text-[10px] text-text-disabled">
                {modules.length} módulos
              </span>
            </div>
            <div className="p-2 space-y-1">
              {modules.map((mod) => {
                const status = mod.installation?.status ?? 'NOT_INSTALLED';
                const active = mod.moduleKey === selectedModuleKey;
                return (
                  <button
                    key={mod.moduleKey}
                    type="button"
                    onClick={() => setSelectedModuleKey(mod.moduleKey)}
                    className={[
                      'w-full rounded-lg px-3 py-2.5 text-left transition-all duration-100',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                      active
                        ? 'bg-surface-subtle shadow-[inset_3px_0_0_oklch(78%_0.180_65)]'
                        : 'hover:bg-surface-subtle',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={[
                          'text-sm font-semibold truncate',
                          active ? 'text-text-primary' : 'text-text-secondary',
                        ].join(' ')}
                      >
                        {mod.name}
                      </p>
                      {mod.isCore && (
                        <Badge variant="accent" size="xs">
                          Core
                        </Badge>
                      )}
                      <Badge
                        variant={
                          status === 'INSTALLED'
                            ? 'success'
                            : status === 'DISABLED'
                              ? 'error'
                              : 'neutral'
                        }
                        size="xs"
                      >
                        {status === 'INSTALLED'
                          ? 'Instalado'
                          : status === 'DISABLED'
                            ? 'Desactivado'
                            : 'Disponible'}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-text-disabled font-mono">{mod.moduleKey}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Detail panel */}
          <section className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
            {selectedModule ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-border bg-surface-subtle">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-text-primary leading-tight">
                      {selectedModule.name}
                    </h2>
                    <p className="text-xs text-text-disabled font-mono mt-0.5">
                      {selectedModule.moduleKey}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {selectedModule.isCore && <Badge variant="accent">Core obligatorio</Badge>}
                    <Badge
                      variant={selectedModule.lifecycleState === 'ACTIVE' ? 'success' : 'warning'}
                    >
                      {selectedModule.lifecycleState}
                    </Badge>
                    {isStoreAdmin && (
                      <button
                        type="button"
                        aria-label="Administrar módulo"
                        onClick={() => setAdminPanelOpen(true)}
                        className="ml-1 rounded-md p-1.5 text-text-disabled hover:text-text-primary hover:bg-surface transition-colors focus-visible:shadow-focus"
                      >
                        <svg
                          width={15}
                          height={15}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {selectedModule.description && (
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {selectedModule.description}
                    </p>
                  )}

                  {/* Stats grid */}
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-surface-subtle p-4">
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-text-disabled">
                        Versión instalada
                      </dt>
                      <dd className="mt-1 text-sm font-bold text-text-primary font-mono">
                        {selectedInstallation?.version ?? '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-text-disabled">
                        Última versión
                      </dt>
                      <dd className="mt-1 text-sm font-bold text-text-primary font-mono">
                        {latestVersion ?? '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-text-disabled">
                        Estado
                      </dt>
                      <dd className="mt-1">
                        <Badge
                          variant={
                            selectedInstallation?.status === 'INSTALLED'
                              ? 'success'
                              : selectedInstallation?.status === 'DISABLED'
                                ? 'error'
                                : 'neutral'
                          }
                          size="xs"
                        >
                          {selectedInstallation?.status ?? 'No instalado'}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-text-disabled">
                        Dependencias
                      </dt>
                      <dd className="mt-1 text-sm font-bold text-text-primary">
                        {selectedModule.dependencies?.length ?? 0}
                      </dd>
                    </div>
                  </dl>

                  {/* Unmet dependencies warning */}
                  {unmetDeps.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      <p className="font-medium mb-1">Dependencias requeridas no instaladas:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {unmetDeps.map((dep) => (
                          <li key={dep.dependsOnModuleKey} className="font-mono text-xs">
                            {dep.dependsOnModuleKey}
                            {dep.versionConstraint && (
                              <span className="text-amber-600 ml-1">({dep.versionConstraint})</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {(!selectedInstallation || selectedInstallation.status === 'DISABLED') && (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={installMutation.isPending}
                        disabled={busy || !latestVersion || !canOperate || unmetDeps.length > 0}
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
                      >
                        Instalar {latestVersion && `v${latestVersion}`}
                      </Button>
                    )}

                    {selectedInstallation?.status === 'INSTALLED' && upgradeTarget && (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={upgradeMutation.isPending}
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
                      >
                        Upgrade a v{upgradeTarget}
                      </Button>
                    )}

                    {selectedInstallation?.status === 'INSTALLED' && !selectedModule.isCore && (
                      <Button
                        variant="danger"
                        size="sm"
                        loading={uninstallMutation.isPending}
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
                      >
                        Desinstalar
                      </Button>
                    )}

                    {selectedInstallation?.status === 'INSTALLED' &&
                      (() => {
                        const meta = getModuleMeta(selectedModule.moduleKey);
                        return meta.route ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(meta.route)}
                          >
                            Abrir {meta.label}
                          </Button>
                        ) : null;
                      })()}

                    {selectedModule.isCore && (
                      <p className="self-center text-xs text-text-disabled">
                        Los módulos núcleo no se pueden desinstalar.
                      </p>
                    )}
                  </div>

                  {/* Version history */}
                  {Array.isArray(selectedModule.versions) && selectedModule.versions.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                        Versiones disponibles
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedModule.versions
                          .slice()
                          .sort((a, b) => compareSemver(b.version, a.version))
                          .map((v) => (
                            <Badge
                              key={`${selectedModule.moduleKey}-${v.version}`}
                              variant={
                                v.version === selectedInstallation?.version ? 'primary' : 'neutral'
                              }
                              size="xs"
                              pill={false}
                            >
                              v{v.version}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-sm text-text-disabled">
                Selecciona un módulo del catálogo
              </div>
            )}
          </section>
        </div>
      )}
      {/* Admin panel */}
      {isStoreAdmin && selectedModule && (
        <SidePanel
          open={adminPanelOpen}
          onClose={() => setAdminPanelOpen(false)}
          title={`Administrar — ${selectedModule.name}`}
          description={selectedModule.moduleKey}
          size="md"
        >
          <div className="space-y-8">
            {/* Lifecycle */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Lifecycle
              </h3>
              <Select
                label="Estado de lifecycle"
                value={adminLifecycle}
                onValueChange={setAdminLifecycle}
                options={[
                  { value: 'ACTIVE', label: 'ACTIVE' },
                  { value: 'DEPRECATED', label: 'DEPRECATED' },
                  { value: 'DISABLED', label: 'DISABLED' },
                ]}
              />
              <Button
                variant="primary"
                size="sm"
                loading={setLifecycleMutation.isPending}
                disabled={
                  setLifecycleMutation.isPending || adminLifecycle === selectedModule.lifecycleState
                }
                onClick={() => void handleSaveLifecycle()}
              >
                Guardar lifecycle
              </Button>
            </section>

            <hr className="border-border" />

            {/* Add version */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Agregar versión
              </h3>
              <Input
                label="Versión"
                placeholder="1.1.0"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                size="sm"
              />
              <Input
                label="Compatibility range"
                placeholder=">=1.0.0"
                value={newCompatRange}
                onChange={(e) => setNewCompatRange(e.target.value)}
                size="sm"
              />
              <Input
                label="Manifest checksum"
                placeholder="sha256:abc123..."
                value={newChecksum}
                onChange={(e) => setNewChecksum(e.target.value)}
                size="sm"
              />
              <Button
                variant="secondary"
                size="sm"
                loading={addVersionMutation.isPending}
                disabled={addVersionMutation.isPending || !newVersion.trim()}
                onClick={() => void handleAddVersion()}
              >
                Agregar versión
              </Button>
            </section>
          </div>
        </SidePanel>
      )}
    </div>
  );
}
