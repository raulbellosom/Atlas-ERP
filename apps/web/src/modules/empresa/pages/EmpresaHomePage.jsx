import useAuthStore from '@/store/auth.store';
import PageHeader from '@/components/ui/PageHeader';
import { useOrganization, useSettings } from '../hooks/useEmpresa';

function InfoCard({ label, value, mono }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <span className="text-xs font-medium text-text-secondary w-36 shrink-0">{label}</span>
      <span className={`text-sm text-text-primary ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
    </div>
  );
}

export default function EmpresaHomePage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;

  const { data: org } = useOrganization(organizationId);
  const { data: settings = [] } = useSettings(organizationId);

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const primaryColor = org?.primaryColor || settingsMap['organization.ui.primary_color'];

  return (
    <div className="space-y-6">
      <PageHeader title="Empresa" description="Resumen de la organización" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 rounded-xl border border-border bg-surface-card p-6 space-y-0">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Datos de la organización
          </h2>
          <InfoCard label="Nombre legal" value={org?.legalName || org?.name} />
          <InfoCard label="Nombre comercial" value={org?.commercialName || org?.name} />
          <InfoCard label="Slug" value={org?.slug} mono />
          <InfoCard label="Dirección" value={org?.address} />
          <InfoCard label="Industria" value={settingsMap['organization.profile.industry']} />
          <InfoCard label="Tamaño" value={settingsMap['organization.profile.company_size']} />
        </div>

        <div className="rounded-xl border border-border bg-surface-card p-6 space-y-4">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Identidad visual
          </h2>
          {primaryColor ? (
            <div className="flex flex-col gap-2">
              <div
                className="w-full h-16 rounded-lg border border-border"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-xs font-mono text-text-secondary">{primaryColor}</span>
            </div>
          ) : (
            <p className="text-sm text-text-disabled">Sin color configurado</p>
          )}
        </div>
      </div>
    </div>
  );
}
