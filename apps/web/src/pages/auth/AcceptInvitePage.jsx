import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['invite-validate', token],
    queryFn: async () => {
      const res = await apiClient.get('/v1/auth/invitations/validate', {
        params: { token },
      });
      return res.data?.data ?? res.data;
    },
    enabled: Boolean(token),
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/v1/auth/invitations/accept', {
        token,
        password,
      });
      return res.data?.data ?? res.data;
    },
  });

  const resolvedError = useMemo(() => {
    if (localError) return localError;
    if (acceptMutation.error?.message) return acceptMutation.error.message;
    if (error?.message) return error.message;
    if (data?.isValid === false) {
      if (data.status === 'expired') return 'La invitacion expiro.';
      if (data.status === 'used') return 'La invitacion ya fue utilizada.';
      if (data.status === 'revoked') return 'La invitacion fue revocada.';
      return 'El token de invitacion es invalido.';
    }
    return '';
  }, [acceptMutation.error, data, error, localError]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError('');

    if (password.length < 8) {
      setLocalError('La contrase�a debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Las contrase�as no coinciden.');
      return;
    }

    await acceptMutation.mutateAsync();
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-8 space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Aceptar invitacion</h1>
          <p className="text-sm text-text-secondary mt-1">Completa tu acceso en AtlasERP.</p>
        </div>

        {isLoading && <p className="text-sm text-text-secondary">Validando invitacion�</p>}

        {data?.isValid && (
          <div className="rounded-xl border border-border bg-surface-subtle p-3">
            <p className="text-sm text-text-primary">{data.email}</p>
            <p className="text-xs text-text-secondary">
              Organizacion: {data.organizationName ?? 'AtlasERP'}
            </p>
          </div>
        )}

        {resolvedError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {resolvedError}
          </div>
        )}

        {!acceptMutation.isSuccess && data?.isValid && (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-text-secondary">Contrase�a</label>
              <input
                className="mt-1 w-full rounded-xl border border-border bg-surface-subtle px-3 py-2 text-sm"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary">Confirmar contrase�a</label>
              <input
                className="mt-1 w-full rounded-xl border border-border bg-surface-subtle px-3 py-2 text-sm"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-ink-900 text-white py-2.5 text-sm font-semibold disabled:opacity-60"
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? 'Activando cuenta�' : 'Activar cuenta'}
            </button>
          </form>
        )}

        {acceptMutation.isSuccess && (
          <div className="space-y-3">
            <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              Tu cuenta fue activada correctamente.
            </div>
            <button
              type="button"
              className="w-full rounded-xl bg-ink-900 text-white py-2.5 text-sm font-semibold"
              onClick={() => navigate('/login', { replace: true })}
            >
              Ir a iniciar sesion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
