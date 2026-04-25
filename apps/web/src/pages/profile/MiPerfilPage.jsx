import { useEffect, useRef, useState } from 'react';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { useProfile, useUpdateProfile, useUploadAvatar, useAvatarUrl } from './useProfile';

/* ── Avatar display ──────────────────────────────────────────────────────── */
function AvatarDisplay({ url, displayName, size = 80 }) {
  if (url) {
    return (
      <img
        src={url}
        alt={`Avatar de ${displayName ?? 'usuario'}`}
        className="rounded-full object-cover border border-border"
        style={{ width: size, height: size }}
      />
    );
  }
  const letter = (displayName ?? 'U')[0].toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0 select-none"
      style={{
        width: size,
        height: size,
        background: 'var(--gradient-primary)',
        fontFamily: 'var(--font-display)',
        fontSize: size * 0.38,
      }}
    >
      {letter}
    </div>
  );
}

/* ── Read-only field ─────────────────────────────────────────────────────── */
function Field({ label, value, mono }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <span className="text-xs font-medium text-text-secondary w-36 shrink-0">{label}</span>
      <span className={`text-sm text-text-primary ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function MiPerfilPage() {
  const storeUser = useAuthStore((s) => s.user);
  const { handleError } = useApiError();
  const { toast } = useToast();
  const fileRef = useRef(null);

  const { data: profile, isLoading } = useProfile();
  const { data: avatarUrl } = useAvatarUrl(profile?.avatarAttachmentId);
  const updateMutation = useUpdateProfile();
  const uploadMutation = useUploadAvatar();

  const [form, setForm] = useState({ displayName: '', phone: '', address: '' });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      displayName: profile.displayName ?? '',
      phone: profile.phone ?? '',
      address: profile.address ?? '',
    });
    setDirty(false);
  }, [profile]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        displayName: form.displayName || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
      toast.success('Perfil actualizado');
      setDirty(false);
    } catch (err) {
      handleError(err);
    }
  }

  async function handleAvatarFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const attachment = await uploadMutation.mutateAsync({
        organizationId: storeUser?.organizationId,
        userId: storeUser?.id ?? profile?.id,
        file,
      });
      await updateMutation.mutateAsync({ avatarAttachmentId: attachment.id });
      toast.success('Foto de perfil actualizada');
    } catch (err) {
      handleError(err);
    } finally {
      e.target.value = '';
    }
  }

  async function handleRemoveAvatar() {
    try {
      await updateMutation.mutateAsync({ avatarAttachmentId: null });
      toast.success('Foto de perfil eliminada');
    } catch (err) {
      handleError(err);
    }
  }

  const user = profile ?? storeUser;
  const statusLabel = user?.isLocked
    ? 'Bloqueado'
    : user?.isActive !== false
      ? 'Activo'
      : 'Inactivo';
  const statusVariant = user?.isLocked ? 'red' : user?.isActive !== false ? 'green' : 'gray';

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Mi Perfil" description="Información personal y configuración de cuenta" />

      {/* ── Avatar ── */}
      <div className="rounded-xl border border-border bg-surface-card p-6">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-5">
          Foto de perfil
        </h2>
        <div className="flex items-center gap-5">
          <AvatarDisplay url={avatarUrl} displayName={user?.displayName} size={80} />
          <div className="flex flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarFile}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploadMutation.isPending || updateMutation.isPending}
            >
              {uploadMutation.isPending ? 'Subiendo…' : 'Cambiar foto'}
            </Button>
            {profile?.avatarAttachmentId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveAvatar}
                disabled={updateMutation.isPending}
                className="text-text-secondary hover:text-red-500"
              >
                Eliminar foto
              </Button>
            )}
            <p className="text-xs text-text-disabled">PNG, JPG o WebP · Máx. 5 MB</p>
          </div>
        </div>
      </div>

      {/* ── Personal info ── */}
      <form onSubmit={handleSave} className="rounded-xl border border-border bg-surface-card p-6">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-5">
          Información personal
        </h2>
        {isLoading ? (
          <p className="text-sm text-text-disabled py-4">Cargando…</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Nombre de display</label>
              <Input
                value={form.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                placeholder="Tu nombre visible"
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Teléfono</label>
              <Input
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+52 55 1234 5678"
                maxLength={30}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Dirección</label>
              <Input
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Calle, colonia, ciudad"
                maxLength={255}
              />
            </div>
            {dirty && (
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
                </Button>
              </div>
            )}
          </div>
        )}
      </form>

      {/* ── Account info (read-only) ── */}
      <div className="rounded-xl border border-border bg-surface-card p-6">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Cuenta
        </h2>
        <Field label="Correo electrónico" value={user?.email} />
        <Field label="ID de usuario" value={user?.id} mono />
        <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
          <span className="text-xs font-medium text-text-secondary w-36 shrink-0">Estado</span>
          <Badge variant={statusVariant} size="xs">
            {statusLabel}
          </Badge>
        </div>
        <Field
          label="Último acceso"
          value={user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('es-MX') : null}
        />
        <Field
          label="Miembro desde"
          value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-MX') : null}
        />
      </div>
    </div>
  );
}
