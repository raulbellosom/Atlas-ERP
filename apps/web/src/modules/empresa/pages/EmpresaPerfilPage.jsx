import { useState, useEffect } from 'react';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useOrganization, useUpdateOrganization } from '../hooks/useEmpresa';

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const LEGAL_ENTITY_TYPES = [
  'Persona Física',
  'S.A. de C.V.',
  'S.R.L. de C.V.',
  'S.A.S.',
  'S.A.P.I. de C.V.',
  'A.C.',
  'Otro',
];

const FISCAL_REGIMES = [
  { value: '601', label: '601 - General de Ley Personas Morales' },
  { value: '612', label: '612 - Personas Físicas con Act. Empresariales' },
  { value: '626', label: '626 - Régimen Simplificado de Confianza (RESICO)' },
  { value: '616', label: '616 - Sin obligaciones fiscales' },
  { value: '621', label: '621 - Incorporación Fiscal' },
  { value: '625', label: '625 - Plataformas Tecnológicas' },
];

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
      {children}
    </div>
  );
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
    legalEntityType: '',
    rfc: '',
    fiscalRegime: '',
    phone: '',
    email: '',
    website: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'MX',
  });
  const [slugManual, setSlugManual] = useState(false);
  const [formReady, setFormReady] = useState(false);

  useEffect(() => {
    if (org) {
      setForm({
        name: org.name ?? '',
        slug: org.slug ?? '',
        legalName: org.legalName ?? '',
        legalEntityType: org.legalEntityType ?? '',
        rfc: org.rfc ?? '',
        fiscalRegime: org.fiscalRegime ?? '',
        phone: org.phone ?? '',
        email: org.email ?? '',
        website: org.website ?? '',
        street: org.street ?? '',
        city: org.city ?? '',
        state: org.state ?? '',
        postalCode: org.postalCode ?? '',
        country: org.country ?? 'MX',
      });
      setSlugManual(false);
      setFormReady(true);
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

  function handleSelect(field) {
    return (value) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (isLoading || !formReady) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil" description="Datos legales y comerciales de la organización" />

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        {/* Identidad */}
        <div className="rounded-xl border border-border bg-surface-card p-6 space-y-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Identidad
          </h3>
          <Field label="Nombre comercial">
            <Input value={form.name} onChange={handleNameChange} required />
          </Field>
          <Field label="Slug">
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
          </Field>
          <Field label="Razón social">
            <Input value={form.legalName} onChange={handleChange('legalName')} />
          </Field>
        </div>

        {/* Datos fiscales */}
        <div className="rounded-xl border border-border bg-surface-card p-6 space-y-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Datos fiscales
          </h3>
          <Field label="Tipo de persona">
            <Select
              value={form.legalEntityType || undefined}
              onValueChange={handleSelect('legalEntityType')}
              options={LEGAL_ENTITY_TYPES.map((t) => ({ value: t, label: t }))}
              placeholder="Selecciona tipo…"
            />
          </Field>
          <Field label="RFC">
            <Input value={form.rfc} onChange={handleChange('rfc')} className="font-mono" />
          </Field>
          <Field label="Régimen fiscal">
            <Select
              value={form.fiscalRegime || undefined}
              onValueChange={handleSelect('fiscalRegime')}
              options={FISCAL_REGIMES}
              placeholder="Selecciona régimen…"
            />
          </Field>
        </div>

        {/* Contacto */}
        <div className="rounded-xl border border-border bg-surface-card p-6 space-y-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Contacto
          </h3>
          <Field label="Teléfono">
            <Input value={form.phone} onChange={handleChange('phone')} type="tel" />
          </Field>
          <Field label="Correo de contacto">
            <Input value={form.email} onChange={handleChange('email')} type="email" />
          </Field>
          <Field label="Sitio web">
            <Input value={form.website} onChange={handleChange('website')} type="url" />
          </Field>
        </div>

        {/* Dirección */}
        <div className="rounded-xl border border-border bg-surface-card p-6 space-y-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Dirección
          </h3>
          <Field label="Calle y número">
            <Input value={form.street} onChange={handleChange('street')} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ciudad / Municipio">
              <Input value={form.city} onChange={handleChange('city')} />
            </Field>
            <Field label="Estado">
              <Input value={form.state} onChange={handleChange('state')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Código postal">
              <Input value={form.postalCode} onChange={handleChange('postalCode')} />
            </Field>
            <Field label="País">
              <Input value={form.country} onChange={handleChange('country')} />
            </Field>
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
