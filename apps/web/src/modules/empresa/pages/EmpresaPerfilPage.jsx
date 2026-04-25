import { useState, useEffect } from 'react';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useOrganization, useUpdateOrganization } from '../hooks/useEmpresa';

export default function EmpresaPerfilPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { toast } = useToast();

  const { data: org, isLoading } = useOrganization(organizationId);
  const updateMutation = useUpdateOrganization();

  const [form, setForm] = useState({ name: '', legalName: '', commercialName: '', address: '' });

  useEffect(() => {
    if (org) {
      setForm({
        name: org.name ?? '',
        legalName: org.legalName ?? '',
        commercialName: org.commercialName ?? '',
        address: org.address ?? '',
      });
    }
  }, [org]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({ id: organizationId, ...form });
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      handleError(err);
    }
  }

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil" description="Datos legales y comerciales de la organización" />

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div className="rounded-xl border border-border bg-surface-card p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Nombre</label>
            <Input value={form.name} onChange={handleChange('name')} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Slug</label>
            <div className="flex items-center h-9 px-3 rounded-lg border border-border bg-surface-subtle text-sm font-mono text-text-disabled select-all">
              {org?.slug ?? '—'}
            </div>
            <p className="text-xs text-text-disabled mt-1">
              El slug es inmutable y se usa en URLs.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Nombre legal
            </label>
            <Input value={form.legalName} onChange={handleChange('legalName')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Nombre comercial
            </label>
            <Input value={form.commercialName} onChange={handleChange('commercialName')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Dirección
            </label>
            <Input value={form.address} onChange={handleChange('address')} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="sm" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
