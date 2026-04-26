import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/ui/SearchInput';
import Checkbox from '@/components/ui/Checkbox';
import { Tabs, TabContent } from '@/components/ui/Tabs';

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useRole(roleId) {
  return useQuery({
    queryKey: ['role', roleId],
    queryFn: async () => {
      const res = await apiClient.get(`/v1/roles/${roleId}`);
      return res.data?.data ?? res.data;
    },
    enabled: Boolean(roleId),
  });
}

function usePermissionsCatalog() {
  return useQuery({
    queryKey: ['permissions-catalog'],
    queryFn: async () => {
      const res = await apiClient.get('/v1/permissions');
      const payload = res.data?.data ?? res.data;
      return Array.isArray(payload) ? payload : [];
    },
    staleTime: 5 * 60_000,
  });
}

function useRolePermissions(roleId) {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      const res = await apiClient.get(`/v1/roles/${roleId}/permissions`);
      const payload = res.data?.data ?? res.data;
      return Array.isArray(payload) ? payload : [];
    },
    enabled: Boolean(roleId),
  });
}

function useSetRolePermissions(roleId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissionIds) =>
      apiClient
        .put(`/v1/roles/${roleId}/permissions`, { permissionIds })
        .then((r) => r.data?.data ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['role-permissions', roleId] });
      qc.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const EMPTY_ARRAY = [];

const MODULE_LABELS = {
  core: 'Núcleo',
  auth: 'Autenticación',
  settings: 'Configuración',
  feature_flags: 'Feature Flags',
  audit: 'Auditoría',
  sync: 'Sincronización',
  finops: 'Tesorería',
  accounting: 'Contabilidad',
  hr: 'Recursos Humanos',
  module_store: 'Module Store',
};

const MODULE_BADGE_VARIANT = {
  core: 'dark',
  auth: 'primary',
  settings: 'neutral',
  feature_flags: 'accent',
  audit: 'warning',
  sync: 'info',
  finops: 'success',
  accounting: 'success',
  hr: 'info',
  module_store: 'accent',
};

// ---------------------------------------------------------------------------
// Componente de tarjeta de permiso
// ---------------------------------------------------------------------------

function PermissionCard({ permission, checked, onChange }) {
  const label = MODULE_LABELS[permission.module] ?? permission.module;
  const badgeVariant = MODULE_BADGE_VARIANT[permission.module] ?? 'neutral';

  // Derivar nombre legible desde la clave: "auth:permission:read" → "Permission · Read"
  const parts = permission.key?.split(':') ?? [];
  const displayName =
    parts.length > 1
      ? parts
          .slice(1)
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' · ')
      : permission.key;

  return (
    <label
      htmlFor={`perm-${permission.key}`}
      className={[
        'group flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer select-none',
        'transition-colors',
        checked
          ? 'border-ink-300 bg-ink-50'
          : 'border-border bg-surface hover:border-border-strong hover:bg-surface-subtle',
      ].join(' ')}
    >
      <Checkbox
        id={`perm-${permission.key}`}
        checked={checked}
        onCheckedChange={onChange}
        className="mt-0.5 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-sm font-semibold text-text-primary leading-snug">
            {displayName}
          </span>
          <Badge variant={badgeVariant} size="xs">
            {label}
          </Badge>
        </div>
        <code className="text-[11px] font-mono text-text-disabled block">{permission.key}</code>
        {permission.description && (
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            {permission.description}
          </p>
        )}
      </div>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Sección de módulo (grupo colapsable)
// ---------------------------------------------------------------------------

function ModuleSection({ moduleKey, perms, selected, onToggle, onToggleAll }) {
  const [expanded, setExpanded] = useState(true);
  const allChecked = perms.every((p) => selected.has(p.key));
  const someChecked = perms.some((p) => selected.has(p.key));
  const checkedCount = perms.filter((p) => selected.has(p.key)).length;
  const label = MODULE_LABELS[moduleKey] ?? moduleKey;
  const badgeVariant = MODULE_BADGE_VARIANT[moduleKey] ?? 'neutral';

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Encabezado del módulo */}
      <div className="flex items-center gap-3 px-4 py-3 bg-surface-subtle border-b border-border">
        <Checkbox
          id={`module-${moduleKey}`}
          checked={allChecked ? true : someChecked ? 'indeterminate' : false}
          onCheckedChange={onToggleAll}
        />
        <button
          type="button"
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <Badge variant={badgeVariant} size="xs">
            {label}
          </Badge>
          <span className="text-xs text-text-disabled font-mono ml-auto">
            {checkedCount}/{perms.length}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={[
              'text-text-disabled transition-transform shrink-0',
              expanded ? 'rotate-180' : '',
            ].join(' ')}
            aria-hidden="true"
          >
            <path d="M3 5l4 4 4-4" />
          </svg>
        </button>
      </div>

      {/* Permisos del módulo */}
      {expanded && (
        <div className="p-3 grid gap-2 sm:grid-cols-2">
          {perms.map((p) => (
            <PermissionCard
              key={p.key}
              permission={p}
              checked={selected.has(p.key)}
              onChange={() => onToggle(p.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lista de permisos (usada dentro de cada tab)
// ---------------------------------------------------------------------------

function PermissionList({ perms, selected, onToggle, onToggleAll, byModule }) {
  if (perms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          className="text-text-disabled mb-3"
          aria-hidden="true"
        >
          <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M14 20h12M20 14v12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-sm text-text-secondary">Sin permisos</p>
      </div>
    );
  }

  // Agrupar los permisos filtrados por módulo manteniendo el orden original
  const moduleOrder = Object.keys(byModule);
  const filteredByModule = moduleOrder.reduce((acc, mod) => {
    const modPerms = perms.filter((p) => p.module === mod);
    if (modPerms.length > 0) acc[mod] = modPerms;
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.entries(filteredByModule).map(([moduleKey, modulePerms]) => (
        <ModuleSection
          key={moduleKey}
          moduleKey={moduleKey}
          perms={modulePerms}
          selected={selected}
          onToggle={onToggle}
          onToggleAll={() => onToggleAll(moduleKey)}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

export default function RolePermissionsPage() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const { toast } = useToast();

  const { data: role, isLoading: loadingRole, error: roleError } = useRole(roleId);
  const { data: catalog = EMPTY_ARRAY, isLoading: loadingCatalog } = usePermissionsCatalog();
  const { data: assigned = EMPTY_ARRAY, isLoading: loadingAssigned } = useRolePermissions(roleId);
  const setPermsMutation = useSetRolePermissions(roleId);

  const [selected, setSelected] = useState(new Set());
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('todos');

  // Inicializar selección cuando lleguen los datos
  useEffect(() => {
    if (assigned.length > 0 || !loadingAssigned) {
      setSelected(new Set(assigned.map((p) => p.key)));
    }
  }, [assigned, loadingAssigned]);

  useEffect(() => {
    if (roleError) handleError(roleError);
  }, [roleError, handleError]);

  // Agrupar catálogo por módulo
  const byModule = useMemo(
    () =>
      catalog.reduce((acc, p) => {
        (acc[p.module] ??= []).push(p);
        return acc;
      }, {}),
    [catalog],
  );

  // Filtrar por búsqueda
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (p) =>
        p.key?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        (MODULE_LABELS[p.module] ?? p.module)?.toLowerCase().includes(q),
    );
  }, [catalog, query]);

  const filteredSelected = useMemo(
    () => filtered.filter((p) => selected.has(p.key)),
    [filtered, selected],
  );

  function toggle(key) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll(moduleKey) {
    const modulePerms = byModule[moduleKey] ?? [];
    const allChecked = modulePerms.every((p) => selected.has(p.key));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) {
        modulePerms.forEach((p) => next.delete(p.key));
      } else {
        modulePerms.forEach((p) => next.add(p.key));
      }
      return next;
    });
  }

  async function handleSave() {
    const idByKey = new Map(catalog.map((p) => [p.key, p.id]));
    const permissionIds = [...selected].map((k) => idByKey.get(k)).filter(Boolean);
    try {
      await setPermsMutation.mutateAsync(permissionIds);
      toast.success(`Permisos de "${role?.name}" actualizados`);
      navigate('/roles');
    } catch (err) {
      handleError(err);
    }
  }

  const isLoading = loadingRole || loadingCatalog || loadingAssigned;

  const breadcrumbs = [{ label: 'Roles', to: '/roles' }, { label: role?.name ?? 'Permisos' }];

  const TABS = [
    { value: 'todos', label: `Todos (${filtered.length})` },
    { value: 'seleccionados', label: `Seleccionados (${filteredSelected.length})` },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      <PageHeader
        title={role ? `Permisos — ${role.name}` : 'Permisos'}
        description={
          role?.description
            ? role.description
            : `Define qué acciones puede realizar este rol en el sistema`
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/roles')}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={setPermsMutation.isPending || isLoading}
            >
              {setPermsMutation.isPending ? 'Guardando…' : 'Guardar permisos'}
            </Button>
          </div>
        }
      />

      {/* Barra de búsqueda + resumen */}
      <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface-subtle">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="text-ink-400 shrink-0"
            aria-hidden="true"
          >
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M9.5 9.5L13 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="label-caps text-[10px]">Buscar permisos</span>
          <span className="ml-auto text-xs text-text-disabled font-mono">
            {selected.size} de {catalog.length} seleccionados
          </span>
        </div>
        <div className="p-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por clave, descripción o módulo…"
            className="w-full sm:w-96"
          />
        </div>
      </div>

      {/* Tabs + contenido */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <svg
            className="animate-spin w-6 h-6 text-ink-400"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
      ) : (
        <Tabs tabs={TABS} value={tab} onValueChange={setTab}>
          <TabContent value="todos" className="pt-5">
            <PermissionList
              perms={filtered}
              selected={selected}
              onToggle={toggle}
              onToggleAll={toggleAll}
              byModule={byModule}
            />
          </TabContent>
          <TabContent value="seleccionados" className="pt-5">
            <PermissionList
              perms={filteredSelected}
              selected={selected}
              onToggle={toggle}
              onToggleAll={toggleAll}
              byModule={byModule}
            />
          </TabContent>
        </Tabs>
      )}
    </div>
  );
}
