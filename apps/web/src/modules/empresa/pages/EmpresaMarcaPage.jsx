import useAuthStore from '@/store/auth.store';
import PageHeader from '@/components/ui/PageHeader';
import { useOrganization, useSettings } from '../hooks/useEmpresa';

export default function EmpresaMarcaPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;

  const { data: org } = useOrganization(organizationId);
  const { data: settings = [] } = useSettings(organizationId);

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const primaryColor = org?.primaryColor || settingsMap['organization.ui.primary_color'];
  const logoUrl = settingsMap['organization.ui.logo_url'];

  return (
    <div className="space-y-6">
      <PageHeader title="Identidad visual" description="Colores y logotipo de la organización" />

      <div className="max-w-lg space-y-4">
        <div className="rounded-xl border border-border bg-surface-card p-6 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Color principal
            </h3>
            {primaryColor ? (
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg border border-border shrink-0"
                  style={{ backgroundColor: primaryColor }}
                />
                <span className="text-sm font-mono text-text-primary">{primaryColor}</span>
              </div>
            ) : (
              <p className="text-sm text-text-disabled">Sin color configurado</p>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Logotipo
            </h3>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo de la organización"
                className="h-16 object-contain rounded border border-border p-2 bg-surface"
              />
            ) : (
              <p className="text-sm text-text-disabled">Sin logotipo configurado</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Los cambios de identidad visual se configuran durante el proceso de instalación de la
            organización. Para actualizar colores o logo, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
