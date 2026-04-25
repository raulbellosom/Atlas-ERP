import useAuthStore from '@/store/auth.store';
import PageHeader from '@/components/ui/PageHeader';
import { useOrganization, useLogoUrl } from '../hooks/useEmpresa';

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
  const { data: logoUrl } = useLogoUrl(org?.logoAttachmentId);

  const primaryColor = org?.primaryColor;
  const address = [org?.street, org?.city, org?.state, org?.postalCode].filter(Boolean).join(', ');

  return (
    <div className="space-y-6">
      <PageHeader title="Empresa" description="Resumen de la organización" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 rounded-xl border border-border bg-surface-card p-6 space-y-0">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Datos de la organización
          </h2>
          <InfoCard label="Nombre comercial" value={org?.name} />
          <InfoCard label="Razón social" value={org?.legalName} />
          <InfoCard label="Tipo de persona" value={org?.legalEntityType} />
          <InfoCard label="RFC" value={org?.rfc} mono />
          <InfoCard label="Régimen fiscal" value={org?.fiscalRegime} />
          <InfoCard label="Slug" value={org?.slug} mono />
          <InfoCard label="Industria" value={org?.industry} />
          <InfoCard label="Tamaño" value={org?.companySize} />
          <InfoCard label="Teléfono" value={org?.phone} />
          <InfoCard label="Correo" value={org?.email} />
          <InfoCard label="Sitio web" value={org?.website} />
          <InfoCard label="Dirección" value={address || undefined} />
        </div>

        <div className="rounded-xl border border-border bg-surface-card p-6 space-y-4">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Identidad visual
          </h2>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo de la organización"
              className="h-16 max-w-full object-contain rounded-lg border border-border p-2 bg-surface"
            />
          ) : (
            <div className="w-full h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-surface-subtle">
              <span className="text-xs text-text-disabled">Sin logotipo</span>
            </div>
          )}
          {primaryColor ? (
            <div className="flex flex-col gap-1.5">
              <div
                className="w-full h-8 rounded-lg border border-border"
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
