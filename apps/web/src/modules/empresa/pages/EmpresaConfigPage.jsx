import { useState } from 'react';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useSettings, useUpdateSetting } from '../hooks/useEmpresa';

function SettingRow({ setting }) {
  const [value, setValue] = useState(setting.value ?? '');
  const { handleError } = useApiError();
  const { toast } = useToast();
  const updateMutation = useUpdateSetting();

  const isDirty = value !== (setting.value ?? '');

  async function handleSave() {
    try {
      await updateMutation.mutateAsync({ id: setting.id, value });
      toast.success(`"${setting.key}" actualizado`);
    } catch (err) {
      handleError(err);
    }
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono text-text-primary truncate">{setting.key}</p>
        {setting.description && (
          <p className="text-xs text-text-disabled mt-0.5">{setting.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 w-72 shrink-0">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 text-sm"
        />
        {isDirty && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            Guardar
          </Button>
        )}
      </div>
    </div>
  );
}

export default function EmpresaConfigPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;

  const { data: settings = [], isLoading } = useSettings(organizationId);

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
    </div>
  );
}
