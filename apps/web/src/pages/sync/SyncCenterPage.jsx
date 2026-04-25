import { useSyncStatus } from '@/hooks/useSyncStatus';
import { formatDateTime } from '@/lib/i18n';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';

export default function SyncCenterPage() {
  const { isOnline, pendingCount, lastSyncAt, hasPending, clearPending } = useSyncStatus();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centro de sincronización"
        description="Estado de sincronización de datos locales"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Conexión"
          value={isOnline ? 'En línea' : 'Sin conexión'}
          dot={isOnline ? 'green' : 'yellow'}
        />
        <StatCard
          label="Pendientes"
          value={String(pendingCount)}
          dot={pendingCount > 0 ? 'yellow' : 'green'}
        />
        <StatCard label="Última sync" value={lastSyncAt ? formatDateTime(lastSyncAt) : 'Nunca'} />
      </div>

      {hasPending && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Hay {pendingCount} operación{pendingCount !== 1 ? 'es' : ''} pendiente
              {pendingCount !== 1 ? 's' : ''} de sincronización
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              Se sincronizarán automáticamente cuando haya conexión disponible
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearPending}>
            Limpiar cola
          </Button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, dot }) {
  return (
    <div className="rounded-xl border border-border bg-surface-card p-5 flex flex-col gap-2">
      <span className="text-xs text-text-secondary">{label}</span>
      <div className="flex items-center gap-2">
        {dot && (
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${dot === 'green' ? 'bg-green-500' : 'bg-amber-400'}`}
          />
        )}
        <span className="text-lg font-semibold text-text-primary">{value}</span>
      </div>
    </div>
  );
}
