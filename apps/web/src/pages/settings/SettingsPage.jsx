import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import useAuthStore from '@/store/auth.store';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';

function useMe() {
  return useQuery({
    queryKey: ['auth-me'],
    queryFn: () => apiClient.get('/v1/auth/me').then((r) => r.data?.data ?? r.data),
  });
}

function useOrg(organizationId) {
  return useQuery({
    queryKey: ['organization', organizationId],
    queryFn: () =>
      apiClient.get(`/v1/organizations/${organizationId}`).then((r) => r.data?.data ?? r.data),
    enabled: Boolean(organizationId),
  });
}

function useOrgSettings(organizationId) {
  return useQuery({
    queryKey: ['settings', organizationId],
    queryFn: async () => {
      const res = await apiClient.get('/v1/settings', {
        params: { organizationId, includeGlobal: false },
      });
      const items = res.data?.data ?? res.data;
      const list = Array.isArray(items) ? items : (items?.items ?? []);
      return Object.fromEntries(list.map((s) => [s.key, s.value]));
    },
    enabled: Boolean(organizationId),
  });
}

const TABS = [
  { id: 'profile', label: 'Mi perfil' },
  { id: 'org', label: 'Organización' },
];

export default function SettingsPage() {
  const storeUser = useAuthStore((s) => s.user);
  const [tab, setTab] = useState('profile');
  const navigate = useNavigate();

  const { data: me } = useMe();
  const { data: org } = useOrg(storeUser?.organizationId);
  const { data: settings = {} } = useOrgSettings(storeUser?.organizationId);

  const user = me ?? storeUser;

  const statusLabel = user?.isLocked
    ? 'Bloqueado'
    : user?.isActive !== false
      ? 'Activo'
      : 'Inactivo';
  const statusVariant = user?.isLocked ? 'red' : user?.isActive !== false ? 'green' : 'gray';

  return (
    <div className="space-y-6">
      <PageHeader title="Configuración" description="Perfil de cuenta y datos de la organización" />

      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-brand-500 text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="rounded-xl border border-border bg-surface-card p-6 space-y-4 max-w-lg">
          <Field label="Correo electrónico" value={user?.email ?? '—'} />
          <Field label="Nombre de display" value={user?.displayName ?? '—'} />
          <Field label="ID de usuario" value={user?.id ?? user?.sub ?? '—'} mono />
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-text-secondary w-32 shrink-0">Estado</span>
            <Badge variant={statusVariant} size="xs">
              {statusLabel}
            </Badge>
          </div>
        </div>
      )}

      {tab === 'org' && (
        <div className="space-y-4 max-w-lg">
          <div className="rounded-xl border border-border bg-surface-card p-6 space-y-4">
            <Field label="Nombre legal" value={org?.name ?? '—'} />
            <Field label="Slug" value={org?.slug ?? '—'} mono />
            <Field label="Industria" value={settings['organization.profile.industry'] ?? '—'} />
            <Field label="Tamaño" value={settings['organization.profile.company_size'] ?? '—'} />
            <Field
              label="Color principal"
              value={settings['organization.ui.primary_color'] ?? '—'}
            />
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/empresa')}>
            Gestionar en Empresa →
          </Button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-text-secondary w-32 shrink-0">{label}</span>
      <span className={`text-sm text-text-primary ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
