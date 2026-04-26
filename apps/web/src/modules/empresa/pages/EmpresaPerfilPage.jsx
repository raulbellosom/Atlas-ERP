import { useState, useEffect } from 'react';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import FormPageLayout from '@/components/ui/FormPageLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useOrganization, useUpdateOrganization, useLogoUrl } from '../hooks/useEmpresa';

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

function PreviewRow({ label, value, mono }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] text-text-disabled w-20 shrink-0 pt-px">{label}</span>
      <span className={`text-xs text-text-primary leading-relaxed ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function OrgPreview({ form, logoUrl }) {
  const regimeLabel = FISCAL_REGIMES.find((r) => r.value === form.fiscalRegime)?.label;
  const hasFiscal = form.rfc || form.fiscalRegime;
  const hasContact = form.phone || form.email || form.website;
  const hasAddress = form.street || form.city || form.state;

  return (
    <div className="rounded-xl border border-border bg-surface-card p-5 space-y-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-disabled">
        Vista previa
      </p>

      {/* Identity header */}
      <div className="flex items-start gap-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo"
            className="w-12 h-12 rounded-xl object-contain border border-border bg-white shrink-0"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0 select-none"
            style={{
              background: 'var(--gradient-accent)',
              fontFamily: 'var(--font-display)',
              fontSize: 20,
            }}
          >
            {(form.name || '?')[0].toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-text-primary text-sm leading-tight truncate">
            {form.name || <span className="text-text-disabled italic">Nombre comercial</span>}
          </p>
          {form.legalName && (
            <p className="text-xs text-text-secondary truncate mt-0.5">{form.legalName}</p>
          )}
          {form.legalEntityType && (
            <span className="inline-block mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface-subtle border border-border text-text-secondary">
              {form.legalEntityType}
            </span>
          )}
        </div>
      </div>

      {/* Fiscal */}
      {hasFiscal && (
        <div className="space-y-1.5 pt-3 border-t border-border">
          <PreviewRow label="RFC" value={form.rfc} mono />
          <PreviewRow label="Régimen" value={regimeLabel} />
        </div>
      )}

      {/* Contacto */}
      {hasContact && (
        <div className="space-y-1.5 pt-3 border-t border-border">
          <PreviewRow label="Teléfono" value={form.phone} />
          <PreviewRow label="Correo" value={form.email} />
          <PreviewRow label="Web" value={form.website} />
        </div>
      )}

      {/* Dirección */}
      {hasAddress && (
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-text-secondary leading-relaxed">
            {[form.street, form.city, form.state, form.postalCode, form.country]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      )}
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
  const { data: logoUrl } = useLogoUrl(org?.logoAttachmentId);

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

      <FormPageLayout aside={<OrgPreview form={form} logoUrl={logoUrl} />}>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="grid grid-cols-2 gap-3">
              <Field label="Teléfono">
                <Input value={form.phone} onChange={handleChange('phone')} type="tel" />
              </Field>
              <Field label="Correo de contacto">
                <Input value={form.email} onChange={handleChange('email')} type="email" />
              </Field>
            </div>
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
      </FormPageLayout>
    </div>
  );
}
