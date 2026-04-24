import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { INSTALLED_MODULES_QUERY_KEY } from '@/hooks/useInstalledModules';
import useAuthStore from '@/store/auth.store';
import { fetchInstalledModules } from '@/modules/module-store/api/module-store.api';
import { getModuleMeta } from '@/modules/module-store/constants/module-manifest';

export default function DashboardPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: installedSet, isLoading } = useQuery({
    queryKey: INSTALLED_MODULES_QUERY_KEY,
    queryFn: fetchInstalledModules,
    enabled: isAuthenticated,
    staleTime: 60_000,
    select: (rows) =>
      new Set(
        Array.isArray(rows)
          ? rows.filter((r) => r?.status === 'INSTALLED').map((r) => r.moduleKey)
          : [],
      ),
  });

  const { data: versionMap } = useQuery({
    queryKey: INSTALLED_MODULES_QUERY_KEY,
    queryFn: fetchInstalledModules,
    enabled: isAuthenticated,
    staleTime: 60_000,
    select: (rows) =>
      new Map(
        Array.isArray(rows)
          ? rows
              .filter((r) => r?.status === 'INSTALLED')
              .map((r) => [r.moduleKey, r.version ?? null])
          : [],
      ),
  });

  const installedKeys = installedSet ? [...installedSet] : [];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">Aplicaciones</h1>
        <p className="text-sm text-text-secondary mt-1">Módulos instalados en tu organización</p>
      </header>

      {isLoading ? (
        <LauncherSkeleton />
      ) : installedKeys.length === 0 ? (
        <EmptyLauncher />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {installedKeys.map((moduleKey) => (
            <ModuleCard
              key={moduleKey}
              moduleKey={moduleKey}
              version={versionMap?.get(moduleKey) ?? null}
            />
          ))}
          <AddModuleCard />
        </div>
      )}
    </div>
  );
}

function ModuleCard({ moduleKey, version }) {
  const navigate = useNavigate();
  const meta = getModuleMeta(moduleKey);

  function handleClick() {
    if (meta.route) navigate(meta.route);
  }

  return (
    <button
      onClick={handleClick}
      disabled={!meta.route}
      className={[
        'flex flex-col items-center gap-3 p-5 rounded-2xl border border-border-default bg-surface-card text-center transition-all',
        meta.route
          ? 'hover:shadow-md hover:border-brand-300 cursor-pointer'
          : 'opacity-60 cursor-not-allowed',
      ].join(' ')}
      title={meta.route ? `Abrir ${meta.label}` : 'Próximamente'}
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${meta.accentColor}`}>
        <meta.icon size={28} className={meta.accentFg} />
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-sm font-medium text-text-primary leading-snug">{meta.label}</span>
        {version && <span className="text-xs text-text-disabled font-mono">v{version}</span>}
        {!meta.route && <span className="text-xs text-text-disabled italic">Próximamente</span>}
      </div>
    </button>
  );
}

function AddModuleCard() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/module-store')}
      className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-dashed border-border-default bg-transparent text-center hover:border-brand-400 hover:bg-surface-subtle transition-all cursor-pointer"
    >
      <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-surface-subtle">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text-disabled"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      </div>
      <span className="text-sm font-medium text-text-secondary">Añadir módulo</span>
    </button>
  );
}

function LauncherSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-border-default bg-surface-card animate-pulse"
        >
          <div className="w-14 h-14 rounded-xl bg-surface-subtle" />
          <div className="h-3 w-20 rounded bg-surface-subtle" />
        </div>
      ))}
    </div>
  );
}

function EmptyLauncher() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-subtle flex items-center justify-center">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text-disabled"
          aria-hidden="true"
        >
          <path d="M21 8a2 2 0 0 0-1.05-1.76l-7-3.94a2 2 0 0 0-1.9 0l-7 3.94A2 2 0 0 0 3 8v8a2 2 0 0 0 1.05 1.76l7 3.94a2 2 0 0 0 1.9 0l7-3.94A2 2 0 0 0 21 16z" />
          <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
        </svg>
      </div>
      <div className="max-w-sm">
        <h2 className="text-lg font-semibold text-text-primary mb-2">No hay módulos instalados</h2>
        <p className="text-sm text-text-secondary">
          Instala tu primer módulo desde el Module Store para empezar a usar la plataforma.
        </p>
      </div>
      <button
        onClick={() => navigate('/module-store')}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
      >
        Ir al Module Store
      </button>
    </div>
  );
}
