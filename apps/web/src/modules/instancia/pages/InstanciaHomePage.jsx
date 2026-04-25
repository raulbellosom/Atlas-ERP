import PageHeader from '@/components/ui/PageHeader';
import { useHealth } from '../hooks/useInstancia';

function resolveState(status) {
  if (status === 'ok' || status === true || status === 'up') return 'ok';
  if (status === 'unknown' || status == null) return 'unknown';
  return 'error';
}

function StatusDot({ status }) {
  const state = resolveState(status);
  const cls = state === 'ok' ? 'bg-green-500' : state === 'error' ? 'bg-red-500' : 'bg-border';
  return <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cls}`} />;
}

function HealthCard({ label, status, detail }) {
  const state = resolveState(status);
  const textCls =
    state === 'ok'
      ? 'text-green-600 dark:text-green-400'
      : state === 'error'
        ? 'text-red-500'
        : 'text-text-disabled';
  const stateLabel = state === 'ok' ? 'Operativo' : state === 'error' ? 'Error' : 'No disponible';

  return (
    <div className="rounded-xl border border-border bg-surface-card p-5 flex items-start gap-3">
      <StatusDot status={status} />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <span className={`text-xs ${textCls}`}>{stateLabel}</span>
        {detail && <span className="text-xs text-text-disabled mt-0.5 truncate">{detail}</span>}
      </div>
    </div>
  );
}

export default function InstanciaHomePage() {
  const { data: health, isLoading } = useHealth();

  const api = health?.status ?? 'unknown';
  const db = health?.details?.database?.status ?? health?.db ?? 'unknown';
  const redis = health?.details?.redis?.status ?? health?.redis ?? 'unknown';
  const storage = health?.details?.storage?.status ?? health?.storage ?? 'unknown';

  return (
    <div className="space-y-6">
      <PageHeader title="Salud del sistema" description="Estado de los servicios de la instancia" />

      {isLoading ? (
        <p className="text-sm text-text-secondary">Verificando servicios…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HealthCard label="API" status={api} />
          <HealthCard label="Base de datos" status={db} />
          <HealthCard label="Redis / caché" status={redis} />
          <HealthCard label="Almacenamiento" status={storage} />
        </div>
      )}

      {health && (
        <div className="rounded-xl border border-border bg-surface-card p-4">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Respuesta completa
          </p>
          <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap break-all">
            {JSON.stringify(health, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
