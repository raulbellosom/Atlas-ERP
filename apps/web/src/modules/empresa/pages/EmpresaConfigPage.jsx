import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import AlertDialog from '@/components/ui/AlertDialog';
import {
  useOrganization,
  useSettings,
  useUpdateSetting,
  useDeleteOrganization,
} from '../hooks/useEmpresa';

const HIDDEN_KEYS = new Set([
  'organization.ui.primary_color',
  'organization.ui.logo_data_url',
  'organization.ui.brand_name',
]);

const SETTING_META = {
  'organization.locale': {
    label: 'Idioma',
    type: 'select',
    options: [
      { value: 'es-MX', label: 'Español (México)' },
      { value: 'es-ES', label: 'Español (España)' },
      { value: 'es-AR', label: 'Español (Argentina)' },
      { value: 'en-US', label: 'English (US)' },
    ],
  },
  'organization.timezone': {
    label: 'Zona horaria',
    type: 'select',
    options: [
      { value: 'America/Mexico_City', label: 'Ciudad de México (UTC-6)' },
      { value: 'America/Monterrey', label: 'Monterrey (UTC-6)' },
      { value: 'America/Merida', label: 'Mérida (UTC-6)' },
      { value: 'America/Tijuana', label: 'Tijuana (UTC-8)' },
      { value: 'America/Bogota', label: 'Bogotá (UTC-5)' },
      { value: 'America/Lima', label: 'Lima (UTC-5)' },
      { value: 'America/Santiago', label: 'Santiago (UTC-4)' },
      { value: 'America/Buenos_Aires', label: 'Buenos Aires (UTC-3)' },
      { value: 'America/New_York', label: 'Nueva York (UTC-5)' },
      { value: 'America/Los_Angeles', label: 'Los Ángeles (UTC-8)' },
      { value: 'Europe/Madrid', label: 'Madrid (UTC+1)' },
      { value: 'UTC', label: 'UTC' },
    ],
  },
  'organization.currency': {
    label: 'Moneda',
    type: 'select',
    options: [
      { value: 'MXN', label: 'Peso mexicano (MXN)' },
      { value: 'USD', label: 'Dólar estadounidense (USD)' },
      { value: 'EUR', label: 'Euro (EUR)' },
      { value: 'COP', label: 'Peso colombiano (COP)' },
      { value: 'ARS', label: 'Peso argentino (ARS)' },
      { value: 'CLP', label: 'Peso chileno (CLP)' },
      { value: 'PEN', label: 'Sol peruano (PEN)' },
      { value: 'BRL', label: 'Real brasileño (BRL)' },
    ],
  },
  'organization.profile.industry': {
    label: 'Industria',
    type: 'select',
    options: [
      { value: 'tecnologia', label: 'Tecnología' },
      { value: 'manufactura', label: 'Manufactura' },
      { value: 'comercio', label: 'Comercio' },
      { value: 'servicios', label: 'Servicios' },
      { value: 'salud', label: 'Salud' },
      { value: 'educacion', label: 'Educación' },
      { value: 'finanzas', label: 'Finanzas' },
      { value: 'construccion', label: 'Construcción' },
      { value: 'transporte', label: 'Transporte y logística' },
      { value: 'alimentos', label: 'Alimentos y bebidas' },
      { value: 'otro', label: 'Otro' },
    ],
  },
  'organization.profile.company_size': {
    label: 'Tamaño de empresa',
    type: 'select',
    options: [
      { value: '1-10', label: '1–10 empleados' },
      { value: '11-50', label: '11–50 empleados' },
      { value: '51-200', label: '51–200 empleados' },
      { value: '201-500', label: '201–500 empleados' },
      { value: '500+', label: 'Más de 500 empleados' },
    ],
  },
  'organization.sync.enabled': {
    label: 'Sincronización activa',
    type: 'boolean',
  },
  'organization.audit.strict_mode': {
    label: 'Auditoría estricta',
    type: 'boolean',
  },
};

function resolveType(key, value) {
  const meta = SETTING_META[key];
  if (meta?.type) return meta.type;
  if (value === 'true' || value === 'false') return 'boolean';
  if (value !== '' && value !== null && !isNaN(Number(value)) && !/[a-zA-Z]/.test(String(value)))
    return 'number';
  return 'text';
}

function SettingRow({ setting }) {
  const [value, setValue] = useState(setting.value ?? '');
  const { handleError } = useApiError();
  const { toast } = useToast();
  const updateMutation = useUpdateSetting();

  const meta = SETTING_META[setting.key];
  const type = resolveType(setting.key, setting.value ?? '');
  const label = meta?.label ?? setting.key;
  const description = meta ? null : setting.description;
  const isDirty = value !== (setting.value ?? '');

  async function handleSave(overrideValue) {
    const saveValue = overrideValue !== undefined ? overrideValue : value;
    try {
      await updateMutation.mutateAsync({ id: setting.id, value: saveValue });
      toast.success(`${label} actualizado`);
    } catch (err) {
      handleError(err);
    }
  }

  async function handleToggle() {
    const next = value === 'true' ? 'false' : 'true';
    setValue(next);
    await handleSave(next);
  }

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-disabled mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2 w-64 shrink-0">
        {type === 'boolean' && (
          <button
            type="button"
            role="switch"
            aria-checked={value === 'true'}
            onClick={handleToggle}
            disabled={updateMutation.isPending}
            className={[
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
              'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              'disabled:opacity-50',
              value === 'true' ? 'bg-brand-500' : 'bg-border',
            ].join(' ')}
          >
            <span
              className={[
                'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm',
                'transition-transform duration-200',
                value === 'true' ? 'translate-x-4' : 'translate-x-0',
              ].join(' ')}
            />
          </button>
        )}

        {type === 'select' && (
          <Select
            value={value || undefined}
            onValueChange={async (v) => {
              setValue(v);
              await handleSave(v);
            }}
            options={meta.options}
            placeholder="Seleccionar…"
            disabled={updateMutation.isPending}
            className="flex-1"
          />
        )}

        {type === 'number' && (
          <>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1 text-sm h-9 px-3 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            />
            {isDirty && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSave()}
                disabled={updateMutation.isPending}
              >
                Guardar
              </Button>
            )}
          </>
        )}

        {type === 'text' && (
          <>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1 text-sm"
            />
            {isDirty && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSave()}
                disabled={updateMutation.isPending}
              >
                Guardar
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function EmpresaConfigPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const { toast } = useToast();

  const { data: org } = useOrganization(organizationId);
  const { data: rawSettings = [], isLoading } = useSettings(organizationId);
  const deleteMutation = useDeleteOrganization();

  const settings = rawSettings.filter((s) => !HIDDEN_KEYS.has(s.key));

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');

  const orgName = org?.name ?? '';
  const deleteConfirmed = confirmName === orgName;

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(organizationId);
      toast.success('Organización eliminada');
      logout();
      navigate('/login');
    } catch (err) {
      handleError(err);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Parámetros de configuración de la organización"
      />

      <div className="rounded-xl border border-border bg-surface-card">
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-surface-subtle rounded-t-xl">
          <span className="label-caps text-[10px]">
            {settings.length} ajuste{settings.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="px-6">
          {isLoading && (
            <p className="py-6 text-sm text-text-disabled text-center">Cargando configuración…</p>
          )}
          {!isLoading && settings.length === 0 && (
            <p className="py-6 text-sm text-text-disabled text-center">
              No hay ajustes configurados
            </p>
          )}
          {settings.map((s) => (
            <SettingRow key={s.id} setting={s} />
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-200 dark:border-red-900 bg-surface-card">
        <div className="flex items-center gap-2 px-6 py-3 border-b border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 rounded-t-xl">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-500 shrink-0"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="label-caps text-[10px] text-red-600 dark:text-red-400">
            Zona de peligro
          </span>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text-primary">Eliminar organización</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Elimina permanentemente la organización y todos sus datos. Esta acción no se puede
                deshacer.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setConfirmName('');
        }}
        title="¿Eliminar organización?"
        description={
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Se eliminarán permanentemente todos los datos de{' '}
              <span className="font-semibold text-text-primary">{orgName}</span>: usuarios, roles,
              empleados, movimientos financieros y configuraciones. Esta acción es irreversible.
            </p>
            <div>
              <p className="text-xs text-text-secondary mb-1.5">
                Escribe <span className="font-mono font-semibold text-text-primary">{orgName}</span>{' '}
                para confirmar:
              </p>
              <Input
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={orgName}
                autoComplete="off"
              />
            </div>
          </div>
        }
        cancelLabel="Cancelar"
        confirmLabel="Eliminar organización"
        onConfirm={handleDelete}
        variant="destructive"
        confirmDisabled={!deleteConfirmed || deleteMutation.isPending}
      />
    </div>
  );
}
