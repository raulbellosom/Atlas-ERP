import { useRef, useState, useEffect } from 'react';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  useOrganization,
  useUpdateOrganization,
  useLogoUrl,
  useUploadLogo,
  useSettings,
} from '../hooks/useEmpresa';

export default function EmpresaMarcaPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { toast } = useToast();
  const fileRef = useRef(null);

  const { data: org } = useOrganization(organizationId);
  const { data: logoUrl } = useLogoUrl(org?.logoAttachmentId);
  const { data: settings = [] } = useSettings(organizationId);
  const updateMutation = useUpdateOrganization();
  const uploadMutation = useUploadLogo();

  const [color, setColor] = useState('');
  const [colorDirty, setColorDirty] = useState(false);

  useEffect(() => {
    const settingColor =
      settings.find((s) => s.key === 'organization.ui.primary_color')?.value ?? '';
    const initial = org?.primaryColor || settingColor || '';
    if (initial) {
      setColor(initial);
      setColorDirty(false);
    }
  }, [org?.primaryColor, settings]);

  function handleColorChange(val) {
    setColor(val);
    setColorDirty(val !== (org?.primaryColor ?? ''));
  }

  async function handleSaveColor() {
    try {
      await updateMutation.mutateAsync({ id: organizationId, primaryColor: color });
      toast.success('Color principal actualizado');
      setColorDirty(false);
    } catch (err) {
      handleError(err);
    }
  }

  async function handleLogoFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const attachment = await uploadMutation.mutateAsync({
        organizationId,
        userId: user?.id,
        file,
      });
      await updateMutation.mutateAsync({ id: organizationId, logoAttachmentId: attachment.id });
      toast.success('Logotipo actualizado');
    } catch (err) {
      handleError(err);
    } finally {
      e.target.value = '';
    }
  }

  async function handleRemoveLogo() {
    try {
      await updateMutation.mutateAsync({ id: organizationId, logoAttachmentId: null });
      toast.success('Logotipo eliminado');
    } catch (err) {
      handleError(err);
    }
  }

  const isSavingColor = updateMutation.isPending && !uploadMutation.isPending;
  const isUploadingLogo = uploadMutation.isPending || (updateMutation.isPending && !colorDirty);

  return (
    <div className="space-y-6">
      <PageHeader title="Identidad visual" description="Colores y logotipo de la organización" />

      <div className="max-w-lg space-y-4">
        {/* Primary color */}
        <div className="rounded-xl border border-border bg-surface-card p-6 space-y-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Color principal
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color || '#000000'}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-10 w-14 rounded-lg border border-border cursor-pointer p-0.5 bg-surface"
              title="Selector de color"
            />
            <Input
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              placeholder="#3b82f6"
              className="flex-1 font-mono text-sm"
            />
            {colorDirty && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveColor}
                disabled={isSavingColor}
              >
                {isSavingColor ? 'Guardando…' : 'Guardar'}
              </Button>
            )}
          </div>
          {color && (
            <div
              className="w-full h-8 rounded-lg border border-border transition-colors"
              style={{ backgroundColor: color }}
            />
          )}
        </div>

        {/* Logo */}
        <div className="rounded-xl border border-border bg-surface-card p-6 space-y-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Logotipo
          </h3>
          {logoUrl ? (
            <div className="flex items-center gap-4">
              <img
                src={logoUrl}
                alt="Logo de la organización"
                className="h-20 max-w-40 object-contain rounded-lg border border-border p-2 bg-surface"
              />
              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={isUploadingLogo}
                >
                  Cambiar logo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveLogo}
                  disabled={updateMutation.isPending}
                  className="text-red-500 hover:text-red-600"
                >
                  Eliminar logo
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <div className="w-full h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-surface-subtle">
                <span className="text-sm text-text-disabled">Sin logotipo configurado</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={isUploadingLogo}
              >
                {isUploadingLogo ? 'Subiendo…' : 'Subir logotipo'}
              </Button>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoFile}
          />
          <p className="text-xs text-text-disabled">
            Formatos permitidos: PNG, JPG, SVG, WebP. Tamaño máximo 5 MB.
          </p>
        </div>
      </div>
    </div>
  );
}
