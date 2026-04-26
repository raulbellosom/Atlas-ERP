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
} from '../hooks/useEmpresa';

const MAX_PALETTE_COLORS = 6;

function toHexChannel(value) {
  return Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0');
}

function rgbToHex(r, g, b) {
  return `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`;
}

function isSimilarColor(a, b) {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);

  const distance = Math.sqrt((ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2);
  return distance < 36;
}

async function extractPaletteFromImage(src) {
  const image = new Image();
  image.crossOrigin = 'anonymous';

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = src;
  });

  const canvas = document.createElement('canvas');
  const maxSize = 96;
  const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1);
  const width = Math.max(1, Math.floor(image.width * ratio));
  const height = Math.max(1, Math.floor(image.height * ratio));
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  ctx.drawImage(image, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  const buckets = new Map();

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 200) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = `${Math.floor(r / 32)}-${Math.floor(g / 32)}-${Math.floor(b / 32)}`;

    const current = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
    current.count += 1;
    current.r += r;
    current.g += g;
    current.b += b;
    buckets.set(key, current);
  }

  const candidates = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .map((entry) =>
      rgbToHex(
        Math.round(entry.r / entry.count),
        Math.round(entry.g / entry.count),
        Math.round(entry.b / entry.count),
      ),
    );

  const unique = [];
  for (const color of candidates) {
    if (unique.some((existing) => isSimilarColor(existing, color))) continue;
    unique.push(color);
    if (unique.length >= MAX_PALETTE_COLORS) break;
  }

  return unique;
}

export default function EmpresaMarcaPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { toast } = useToast();
  const fileRef = useRef(null);

  const { data: org } = useOrganization(organizationId);
  const { data: logoUrl } = useLogoUrl(org?.logoAttachmentId);
  const updateMutation = useUpdateOrganization();
  const uploadMutation = useUploadLogo();

  const [color, setColor] = useState('');
  const [colorDirty, setColorDirty] = useState(false);
  const [paletteColors, setPaletteColors] = useState([]);
  const [extractingPalette, setExtractingPalette] = useState(false);

  useEffect(() => {
    const initial = org?.primaryColor || '';
    if (initial) {
      setColor(initial);
      setColorDirty(false);
    }
  }, [org?.primaryColor]);

  useEffect(() => {
    let canceled = false;

    async function loadPaletteFromLogo() {
      if (!logoUrl) {
        setPaletteColors([]);
        return;
      }

      setExtractingPalette(true);
      try {
        const colors = await extractPaletteFromImage(logoUrl);
        if (!canceled) setPaletteColors(colors);
      } catch {
        if (!canceled) setPaletteColors([]);
      } finally {
        if (!canceled) setExtractingPalette(false);
      }
    }

    loadPaletteFromLogo();

    return () => {
      canceled = true;
    };
  }, [logoUrl]);

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

    const localUrl = URL.createObjectURL(file);
    setExtractingPalette(true);
    try {
      const colors = await extractPaletteFromImage(localUrl);
      setPaletteColors(colors);
    } catch {
      setPaletteColors([]);
    } finally {
      setExtractingPalette(false);
      URL.revokeObjectURL(localUrl);
    }

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

          {logoUrl && (
            <div className="space-y-2">
              <p className="text-xs text-text-secondary">Colores sugeridos desde el logo</p>
              {extractingPalette ? (
                <p className="text-xs text-text-disabled">Analizando colores del logo…</p>
              ) : paletteColors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {paletteColors.map((paletteColor) => {
                    const active = color?.toLowerCase() === paletteColor.toLowerCase();
                    return (
                      <button
                        key={paletteColor}
                        type="button"
                        onClick={() => handleColorChange(paletteColor)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition ${
                          active
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-border bg-surface hover:bg-surface-subtle'
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full border border-black/10"
                          style={{ backgroundColor: paletteColor }}
                        />
                        {paletteColor}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-text-disabled">
                  No se pudieron obtener colores del logo. Puedes elegir un color personalizado.
                </p>
              )}
            </div>
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
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleLogoFile}
          />
          <p className="text-xs text-text-disabled">
            Formatos permitidos: PNG, JPG, WEBP. Tamaño máximo recomendado: 5 MB.
          </p>
        </div>
      </div>
    </div>
  );
}
