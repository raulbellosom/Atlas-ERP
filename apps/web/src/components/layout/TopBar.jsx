import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '@/store/auth.store';
import { apiClient } from '@/api/client';
import ConnectionIndicator from './ConnectionIndicator';
import { fetchInstalledModules } from '@/modules/module-store/api/module-store.api';
import { getModuleMeta } from '@/modules/module-store/constants/module-manifest';
import { INSTALLED_MODULES_QUERY_KEY } from '@/hooks/useInstalledModules';
import { fetchProfile, fetchAvatarUrl } from '@/pages/profile/profile.api';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function getInitial(user) {
  return (user?.displayName ?? user?.email ?? 'U')[0].toUpperCase();
}

/* ── Avatar ──────────────────────────────────────────────────────────────── */
function Avatar({ initial, imageUrl, size = 8, dot = false }) {
  return (
    <div className="relative shrink-0" style={{ width: `${size * 4}px`, height: `${size * 4}px` }}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={initial}
          className="w-full h-full rounded-full object-cover ring-1 ring-white/10"
        />
      ) : (
        <div
          className="w-full h-full rounded-full flex items-center justify-center ring-1 ring-white/10"
          style={{ background: 'var(--gradient-primary)' }}
          aria-hidden="true"
        >
          <span
            className="font-bold text-white select-none"
            style={{ fontFamily: 'var(--font-display)', fontSize: `${size * 1.75}px` }}
          >
            {initial}
          </span>
        </div>
      )}
      {dot && (
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface"
          style={{ background: 'oklch(70% 0.18 145)' }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/* ── Company badge (mini monogram) ───────────────────────────────────────── */
function CompanyBadge({ name, color, logoUrl }) {
  if (logoUrl) {
    return (
      <div className="w-5 h-5 rounded-md bg-white border border-border overflow-hidden flex items-center justify-center shrink-0">
        <img
          src={logoUrl}
          alt={`Logo de ${name ?? 'empresa'}`}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  const letter = name?.[0]?.toUpperCase() ?? '?';
  return (
    <div
      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-white"
      style={{
        background: color || 'var(--gradient-accent)',
        fontFamily: 'var(--font-display)',
        fontSize: '10px',
        fontWeight: 700,
      }}
      aria-hidden="true"
    >
      {letter}
    </div>
  );
}

/* ── Dropdown item ───────────────────────────────────────────────────────── */
function MenuItem({ children, icon, destructive = false, onSelect }) {
  return (
    <Dropdown.Item
      onSelect={onSelect}
      className={[
        'relative flex items-center gap-2.5 px-3 py-2 rounded-md text-sm',
        'cursor-pointer select-none outline-none transition-colors',
        destructive
          ? 'text-error data-highlighted:bg-red-50 data-highlighted:text-error'
          : 'text-text-primary data-highlighted:bg-ink-50 data-highlighted:text-ink-700',
      ].join(' ')}
    >
      {icon && <span className="w-4 h-4 shrink-0 opacity-70">{icon}</span>}
      {children}
    </Dropdown.Item>
  );
}

/* ── Icons ───────────────────────────────────────────────────────────────── */
const IcoUser = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IcoLogOut = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IcoChevron = ({ open }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* ── App Switcher ────────────────────────────────────────────────────────── */
function AppSwitcher() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [open, setOpen] = useState(false);

  const { data: installed = [] } = useQuery({
    queryKey: INSTALLED_MODULES_QUERY_KEY,
    queryFn: fetchInstalledModules,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const installedApps = installed
    .filter((r) => r.status === 'INSTALLED')
    .map((r) => ({ moduleKey: r.moduleKey, meta: getModuleMeta(r.moduleKey) }))
    .filter((a) => a.meta.route);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={[
            'w-9 h-9 flex items-center justify-center rounded-lg',
            'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
            'active:scale-95 transition-all duration-100',
            'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
            open ? 'bg-surface-subtle text-text-primary' : '',
          ].join(' ')}
          aria-label="Cambiar de aplicación"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className={[
            'z-50 w-72 rounded-xl border border-border bg-surface shadow-lg p-3',
            'data-[state=open]:animate-atlas-in data-[state=closed]:animate-atlas-out',
          ].join(' ')}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-disabled px-1 mb-2">
            Aplicaciones instaladas
          </p>

          {installedApps.length === 0 ? (
            <p className="text-xs text-text-secondary px-1 py-2">
              No hay aplicaciones instaladas con acceso directo.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {installedApps.map(({ moduleKey, meta }) => (
                <button
                  key={moduleKey}
                  onClick={() => {
                    navigate(meta.route);
                    setOpen(false);
                  }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-surface-subtle transition-colors text-center"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.accentColor}`}
                  >
                    <meta.icon size={20} className={meta.accentFg} />
                  </div>
                  <span className="text-[11px] font-medium text-text-primary leading-tight">
                    {meta.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-border">
            <button
              onClick={() => {
                navigate('/dashboard');
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-text-secondary hover:bg-surface-subtle transition-colors"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Ir al launcher
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/* ── Main TopBar ──────────────────────────────────────────────────────────── */
export default function TopBar({ onMenuToggle }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: orgData } = useQuery({
    queryKey: ['organization', user?.organizationId],
    queryFn: () =>
      apiClient.get(`/v1/organizations/${user.organizationId}`).then((r) => r.data?.data ?? r.data),
    enabled: Boolean(user?.organizationId),
    staleTime: 5 * 60 * 1000,
  });

  const { data: logoUrl = null } = useQuery({
    queryKey: ['attachment-url', orgData?.logoAttachmentId],
    queryFn: () =>
      apiClient.get(`/v1/attachments/${orgData.logoAttachmentId}/download`).then((r) => {
        const p = r.data?.data ?? r.data;
        return p?.downloadUrl ?? null;
      }),
    enabled: Boolean(orgData?.logoAttachmentId),
    staleTime: 4 * 60 * 1000,
  });

  const { data: profileData } = useQuery({
    queryKey: ['profile-me'],
    queryFn: fetchProfile,
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
  });

  const { data: avatarUrl = null } = useQuery({
    queryKey: ['avatar-url', profileData?.avatarAttachmentId],
    queryFn: () => fetchAvatarUrl(profileData.avatarAttachmentId),
    enabled: Boolean(profileData?.avatarAttachmentId),
    staleTime: 4 * 60 * 1000,
  });

  const companyName = orgData?.commercialName || orgData?.name || null;
  const companyColor = orgData?.primaryColor || null;
  const companyLogoUrl = logoUrl;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initial = getInitial(user);
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuario';

  return (
    <header
      className={[
        'h-14 flex items-center justify-between',
        'px-4 md:px-6',
        'bg-surface border-b border-border',
        '[box-shadow:0_1px_0_0_var(--color-border)]',
        'shrink-0 z-10 sticky top-0',
      ].join(' ')}
    >
      {/* ── Left ── */}
      <div className="flex items-center gap-2.5">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className={[
              'lg:hidden w-9 h-9 flex items-center justify-center rounded-lg -ml-1',
              'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
              'active:scale-95 active:bg-surface-sunken transition-all duration-100',
              'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
            ].join(' ')}
            aria-label="Abrir menú de navegación"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="16" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        <AppSwitcher />

        <div className="hidden lg:flex items-center gap-1.5 select-none">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: 'oklch(72.5% 0.192 65)' }}
            aria-hidden="true"
          />
          <span
            className="font-semibold tracking-widest uppercase text-text-disabled"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}
          >
            Atlas ERP
          </span>
        </div>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-2">
        <ConnectionIndicator />
        <div className="hidden sm:block w-px h-5 bg-border mx-0.5" aria-hidden="true" />

        {user && (
          <Dropdown.Root open={open} onOpenChange={setOpen}>
            {/* ── Trigger pill ── */}
            <Dropdown.Trigger asChild>
              <button
                className={[
                  'flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full',
                  'border border-transparent transition-all duration-150',
                  'hover:bg-surface-subtle hover:border-border',
                  'active:scale-[0.97]',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
                  open ? 'bg-surface-subtle border-border' : '',
                ].join(' ')}
                aria-label={`Menú de ${displayName}`}
              >
                <Avatar initial={initial} imageUrl={avatarUrl} size={7} dot />
                <span
                  className="hidden sm:block text-sm font-medium text-text-primary max-w-24 truncate"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {displayName}
                </span>
                <span className="hidden sm:flex text-text-disabled">
                  <IcoChevron open={open} />
                </span>
              </button>
            </Dropdown.Trigger>

            <Dropdown.Portal>
              <Dropdown.Content
                align="end"
                sideOffset={8}
                className={[
                  'z-50 w-64 overflow-hidden',
                  'rounded-xl border border-border bg-surface shadow-lg',
                  'data-[state=open]:animate-atlas-in data-[state=closed]:animate-atlas-out',
                  'p-1',
                ].join(' ')}
              >
                {/* ── Profile header — non-interactive ── */}
                <div className="px-3 pt-3 pb-2.5 mb-1">
                  <div className="flex items-start gap-3">
                    <Avatar initial={initial} imageUrl={avatarUrl} size={10} />
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p
                        className="text-sm font-semibold text-text-primary truncate leading-tight"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {user.displayName || displayName}
                      </p>
                      <p className="text-xs text-text-secondary truncate mt-0.5 leading-tight">
                        {user.email}
                      </p>
                      {companyName && (
                        <div className="flex items-center gap-1.5 mt-2 py-1 px-2 rounded-lg bg-surface-subtle border border-border/60">
                          <CompanyBadge
                            name={companyName}
                            color={companyColor}
                            logoUrl={companyLogoUrl}
                          />
                          <span
                            className="text-[11px] font-medium text-text-secondary truncate"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {companyName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Divider ── */}
                <Dropdown.Separator className="h-px bg-border mx-1 mb-1" />

                {/* ── Navigation items ── */}
                <MenuItem icon={<IcoUser />} onSelect={() => navigate('/profile')}>
                  Mi Perfil
                </MenuItem>

                <Dropdown.Separator className="h-px bg-border mx-1 my-1" />

                <MenuItem icon={<IcoLogOut />} destructive onSelect={handleLogout}>
                  Cerrar sesión
                </MenuItem>

                {/* bottom padding */}
                <div className="h-1" />
              </Dropdown.Content>
            </Dropdown.Portal>
          </Dropdown.Root>
        )}
      </div>
    </header>
  );
}
