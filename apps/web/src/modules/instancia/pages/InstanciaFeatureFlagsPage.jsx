import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import { useFeatureFlags, useToggleFeatureFlag } from '../hooks/useInstancia';

function ToggleButton({ isActive, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        isActive ? 'bg-green-500' : 'bg-surface-subtle border border-border',
      ].join(' ')}
      aria-checked={isActive}
      role="switch"
    >
      <span
        className={[
          'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm',
          'ring-0 transition-transform duration-200',
          isActive ? 'translate-x-4' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}

export default function InstanciaFeatureFlagsPage() {
  const { handleError } = useApiError();
  const { toast } = useToast();

  const { data: flags = [], isLoading } = useFeatureFlags();
  const toggleMutation = useToggleFeatureFlag();

  async function handleToggle(flag) {
    try {
      await toggleMutation.mutateAsync(flag.key);
      toast.success(`"${flag.key}" ${flag.isActive ? 'desactivado' : 'activado'}`);
    } catch (err) {
      handleError(err);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature flags"
        description="Funcionalidades activables por configuración"
      />

      <div className="rounded-xl border border-border bg-surface-card">
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-surface-subtle rounded-t-xl">
          <span className="label-caps text-[10px]">
            {flags.length} función{flags.length !== 1 ? 'es' : ''}
          </span>
        </div>
        <div className="divide-y divide-border">
          {isLoading && (
            <p className="px-6 py-6 text-sm text-text-disabled text-center">Cargando…</p>
          )}
          {!isLoading && flags.length === 0 && (
            <p className="px-6 py-6 text-sm text-text-disabled text-center">
              No hay feature flags configurados
            </p>
          )}
          {flags.map((flag) => (
            <div key={flag.key} className="flex items-center gap-4 px-6 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-text-primary">{flag.key}</span>
                  <Badge variant={flag.isActive ? 'green' : 'gray'} size="xs">
                    {flag.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                {flag.description && (
                  <p className="text-xs text-text-secondary mt-0.5">{flag.description}</p>
                )}
              </div>
              <ToggleButton
                isActive={flag.isActive}
                onClick={() => handleToggle(flag)}
                disabled={toggleMutation.isPending}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
