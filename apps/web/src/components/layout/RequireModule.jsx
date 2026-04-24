import { Link } from 'react-router-dom';
import { useInstalledModules } from '@/hooks/useInstalledModules';

export default function RequireModule({ moduleKey, children }) {
  const { installedModules, isLoading } = useInstalledModules();

  if (isLoading) return children;
  if (!installedModules.has(moduleKey)) return <ModuleNotInstalled moduleKey={moduleKey} />;
  return children;
}

function ModuleNotInstalled({ moduleKey }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center">
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
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      </div>
      <div className="max-w-sm">
        <h2 className="text-lg font-semibold text-text-primary mb-2">Módulo no instalado</h2>
        <p className="text-sm text-text-secondary">
          El módulo{' '}
          <span className="font-mono text-xs bg-surface-subtle px-1.5 py-0.5 rounded text-text-primary">
            {moduleKey}
          </span>{' '}
          no está instalado en tu organización.
        </p>
      </div>
      <Link
        to="/module-store"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
      >
        Ir al Module Store
      </Link>
    </div>
  );
}
