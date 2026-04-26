import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import {
  useEmailOutboundConfig,
  useTestEmailOutbound,
  useUpdateEmailOutboundConfig,
} from '../hooks/useInstancia';

const EMPTY_FORM = {
  provider: 'smtp',
  host: '',
  port: 587,
  secure: false,
  user: '',
  password: '',
  fromName: 'AtlasERP',
  fromEmail: '',
  timeoutMs: 10000,
  isActive: false,
};

function PasswordField({ label, value, placeholder, onChange }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-text-primary select-none">{label}</label>
      <div className="relative flex items-center rounded-lg border border-border bg-surface transition-all duration-150 hover:border-border-strong focus-within:border-ink-500 focus-within:[box-shadow:var(--shadow-focus)]">
        <input
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-disabled focus:outline-none h-11 px-3.5 pr-11 py-[0.6875rem]"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-2.5 p-1 rounded-md text-text-disabled hover:text-text-primary hover:bg-surface-subtle"
          aria-label={visible ? 'Ocultar password SMTP' : 'Mostrar password SMTP'}
        >
          {visible ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default function InstanciaEmailOutboundPage() {
  const { handleError } = useApiError();
  const { toast } = useToast();

  const { data, isLoading } = useEmailOutboundConfig();
  const updateMutation = useUpdateEmailOutboundConfig();
  const testMutation = useTestEmailOutbound();

  const [form, setForm] = useState(EMPTY_FORM);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    if (!data) return;
    setForm((prev) => ({
      ...prev,
      provider: data.provider ?? 'smtp',
      host: data.host ?? '',
      port: data.port ?? 587,
      secure: data.secure ?? false,
      user: data.user ?? '',
      password: '',
      fromName: data.fromName ?? 'AtlasERP',
      fromEmail: data.fromEmail ?? '',
      timeoutMs: data.timeoutMs ?? 10000,
      isActive: data.isActive ?? false,
    }));
  }, [data]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    try {
      await updateMutation.mutateAsync({
        ...form,
        port: Number(form.port),
        timeoutMs: Number(form.timeoutMs),
      });
      toast.success('Configuracion de correo actualizada.');
    } catch (err) {
      handleError(err);
    }
  }

  async function handleSendTest() {
    try {
      const recipient = testEmail.trim() || undefined;
      await testMutation.mutateAsync({ toEmail: recipient });
      toast.success(`Correo de prueba encolado${recipient ? ` para ${recipient}` : ''}.`);
    } catch (err) {
      handleError(err);
    }
  }

  const passwordPlaceholder = data?.hasPassword
    ? '******** (dejar vacio para conservar)'
    : 'Ingresa password SMTP';

  const effectiveTestRecipient = testEmail.trim() || form.fromEmail || 'fromEmail';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Correo saliente"
        description="Configuracion global SMTP para invitaciones y notificaciones"
      />

      <form
        onSubmit={handleSave}
        className="rounded-xl border border-border bg-surface-card p-5 space-y-4"
      >
        {isLoading ? (
          <p className="text-sm text-text-secondary">Cargando configuracion...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4">
                <Input label="Proveedor" value="smtp" disabled />
              </div>
              <div className="lg:col-span-6">
                <Input
                  label="SMTP host"
                  value={form.host}
                  onChange={(event) => set('host', event.target.value)}
                  required
                />
              </div>
              <div className="lg:col-span-2">
                <Input
                  label="Puerto"
                  type="number"
                  value={String(form.port)}
                  onChange={(event) => set('port', event.target.value)}
                  required
                />
              </div>
              <div className="lg:col-span-8">
                <Input
                  label="SMTP user"
                  value={form.user}
                  onChange={(event) => set('user', event.target.value)}
                  required
                />
              </div>
              <div className="lg:col-span-4 flex items-end">
                <label className="flex items-center gap-2 text-sm text-text-secondary h-11">
                  <input
                    type="checkbox"
                    checked={Boolean(form.secure)}
                    onChange={(event) => set('secure', event.target.checked)}
                  />
                  Usar TLS/SSL
                </label>
              </div>
              <div className="lg:col-span-12">
                <PasswordField
                  label="SMTP password"
                  value={form.password}
                  onChange={(event) => set('password', event.target.value)}
                  placeholder={passwordPlaceholder}
                />
              </div>
              <div className="lg:col-span-6">
                <Input
                  label="From name"
                  value={form.fromName}
                  onChange={(event) => set('fromName', event.target.value)}
                  required
                />
              </div>
              <div className="lg:col-span-6">
                <Input
                  label="From email"
                  type="email"
                  value={form.fromEmail}
                  onChange={(event) => set('fromEmail', event.target.value)}
                  required
                />
              </div>
              <div className="lg:col-span-4">
                <Input
                  label="Timeout (ms)"
                  type="number"
                  value={String(form.timeoutMs)}
                  onChange={(event) => set('timeoutMs', event.target.value)}
                />
              </div>
              <div className="lg:col-span-8 flex items-end">
                <label className="flex items-center gap-2 text-sm text-text-secondary h-11">
                  <input
                    type="checkbox"
                    checked={Boolean(form.isActive)}
                    onChange={(event) => set('isActive', event.target.checked)}
                  />
                  Activar correo saliente
                </label>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="primary" size="sm" type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </>
        )}
      </form>

      <div className="rounded-xl border border-border bg-surface-card p-5 space-y-3">
        <p className="text-sm font-medium text-text-primary">Probar envio</p>
        <Input
          label="Email destino de prueba"
          type="email"
          value={testEmail}
          onChange={(event) => setTestEmail(event.target.value)}
          placeholder="ejemplo@dominio.com (opcional)"
        />
        <p className="text-xs text-text-secondary">
          Si se deja vacio, se enviara a: {effectiveTestRecipient}
        </p>
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSendTest}
            disabled={testMutation.isPending}
          >
            {testMutation.isPending ? 'Encolando...' : 'Enviar prueba'}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-card p-5 space-y-1">
        <p className="text-sm font-medium text-text-primary">Salud del canal</p>
        <p className="text-xs text-text-secondary">
          Ultimo exito: {data?.health?.lastSuccessAt ?? 'Sin registros'}
        </p>
        <p className="text-xs text-text-secondary">
          Ultimo error: {data?.health?.lastErrorAt ?? 'Sin registros'}
        </p>
        {data?.health?.lastErrorMessage && (
          <p className="text-xs text-red-600">{data.health.lastErrorMessage}</p>
        )}
      </div>
    </div>
  );
}
