import { useState, useEffect } from 'react';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useOrganization, useUpdateOrganization } from '../hooks/useEmpresa';

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function EmpresaPerfilPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { toast } = useToast();

  const { data: org, isLoading } = useOrganization(organizationId);
  const updateMutation = useUpdateOrganization();

  const [form, setForm] = useState({
    name: '',
    slug: '',
    legalName: '',
    commercialName: '',
    address: '',
  });
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (org) {
      setForm({
        name: org.name ?? '',
        slug: org.slug ?? '',
        legalName: org.legalName ?? '',
        commercialName: org.commercialName ?? '',
        address: org.address ?? '',
      });
      setSlugManual(false);
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

  function handleNameChange(e) {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      ...(slugManual ? {} : { slug: slugify(name) }),
    }));
  }

  function handleSlugChange(e) {
    setSlugManual(true);
    setForm((prev) => ({ ...prev, slug: e.target.value }));
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
            <Input value={form.name} onChange={handleNameChange} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Slug</label>
            <Input
              value={form.slug}
              onChange={handleSlugChange}
              className="font-mono text-sm"
              placeholder="mi-organizacion"
            />
            <p className="text-xs text-text-disabled mt-1">
              Se actualiza automáticamente al cambiar el nombre. Cambiar el slug puede romper URLs
              existentes.
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
