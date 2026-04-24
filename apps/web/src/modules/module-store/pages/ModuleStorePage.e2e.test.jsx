import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@/test-utils/render';
import ModuleStorePage from './ModuleStorePage';

const authStoreSelectorMock = vi.fn();
const onlineStatusHookMock = vi.fn();
const syncStatusHookMock = vi.fn();
const permissionsHookMock = vi.fn();
const apiErrorHookMock = vi.fn();
const toastHookMock = vi.fn();

const fetchModuleCatalogMock = vi.fn();
const fetchInstalledModulesMock = vi.fn();
const installModuleMock = vi.fn();
const uninstallModuleMock = vi.fn();
const upgradeModuleMock = vi.fn();
const fetchModuleJobMock = vi.fn();
const setLifecycleMutationMock = vi.fn();
const addVersionMutationMock = vi.fn();

vi.mock('@/store/auth.store', () => ({
  default: (...args) => authStoreSelectorMock(...args),
}));

vi.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: (...args) => onlineStatusHookMock(...args),
}));

vi.mock('@/hooks/useSyncStatus', () => ({
  useSyncStatus: (...args) => syncStatusHookMock(...args),
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: (...args) => permissionsHookMock(...args),
}));

vi.mock('@/hooks/useApiError', () => ({
  useApiError: (...args) => apiErrorHookMock(...args),
}));

vi.mock('@/components/ui/Toast', () => ({
  useToast: (...args) => toastHookMock(...args),
}));

vi.mock('../api/module-store.api', () => ({
  fetchModuleCatalog: (...args) => fetchModuleCatalogMock(...args),
  fetchInstalledModules: (...args) => fetchInstalledModulesMock(...args),
  installModule: (...args) => installModuleMock(...args),
  uninstallModule: (...args) => uninstallModuleMock(...args),
  upgradeModule: (...args) => upgradeModuleMock(...args),
  fetchModuleJob: (...args) => fetchModuleJobMock(...args),
}));

vi.mock('../hooks/useModuleStore', () => ({
  useSetLifecycle: () => ({
    mutateAsync: (...args) => setLifecycleMutationMock(...args),
    isPending: false,
  }),
  useAddVersion: () => ({
    mutateAsync: (...args) => addVersionMutationMock(...args),
    isPending: false,
  }),
}));

function renderModuleStorePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ModuleStorePage />
    </QueryClientProvider>,
  );
}

function buildCatalogFixture() {
  return [
    {
      moduleKey: 'accounting',
      name: 'Contabilidad',
      description: 'Modulo contable',
      isCore: false,
      lifecycleState: 'ACTIVE',
      versions: [
        { version: '1.1.0', compatibilityRange: '^1.0.0' },
        { version: '1.0.0', compatibilityRange: '^1.0.0' },
      ],
      dependencies: [{ dependsOnModuleKey: 'core-platform' }],
    },
    {
      moduleKey: 'core-platform',
      name: 'Plataforma Base',
      description: 'Nucleo',
      isCore: true,
      lifecycleState: 'ACTIVE',
      versions: [{ version: '1.0.0', compatibilityRange: '^1.0.0' }],
      dependencies: [],
    },
  ];
}

describe('ModuleStorePage e2e UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    authStoreSelectorMock.mockImplementation((selector) =>
      selector({
        user: {
          id: 'user-e2e-web',
          organizationId: 'org-e2e-web',
          role: 'ADMIN',
          permissions: ['module_store:read', 'module_store:install', 'module_store:admin'],
        },
      }),
    );

    onlineStatusHookMock.mockReturnValue(true);
    syncStatusHookMock.mockReturnValue({ pendingCount: 0 });
    permissionsHookMock.mockReturnValue({
      hasAny: () => true,
      hasAll: () => true,
      isAdmin: true,
    });
    apiErrorHookMock.mockReturnValue({ handleError: vi.fn() });
    toastHookMock.mockReturnValue({
      toast: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn(),
      },
    });

    fetchModuleCatalogMock.mockResolvedValue(buildCatalogFixture());
    fetchInstalledModulesMock.mockResolvedValue([]);
    fetchModuleJobMock.mockResolvedValue({ id: 'job-web-e2e-1', status: 'COMPLETED' });
    installModuleMock.mockResolvedValue({ id: 'job-web-e2e-1', status: 'RUNNING' });
    uninstallModuleMock.mockResolvedValue({ id: 'job-web-e2e-2', status: 'RUNNING' });
    upgradeModuleMock.mockResolvedValue({ id: 'job-web-e2e-3', status: 'RUNNING' });
    setLifecycleMutationMock.mockResolvedValue({});
    addVersionMutationMock.mockResolvedValue({});
  });

  it('instala modulo en linea desde el flujo UI', async () => {
    const user = userEvent.setup();
    renderModuleStorePage();

    await screen.findByText('Contabilidad');
    const installButton = await screen.findByRole('button', { name: /Instalar/i });
    await user.click(installButton);

    await waitFor(() => {
      expect(installModuleMock).toHaveBeenCalledTimes(1);
    });

    expect(installModuleMock).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'org-e2e-web',
        moduleKey: 'accounting',
        version: '1.1.0',
      }),
      expect.any(Object),
    );
  });

  it('encola operacion local cuando la UI esta offline', async () => {
    onlineStatusHookMock.mockReturnValue(false);
    const user = userEvent.setup();

    renderModuleStorePage();
    await screen.findByText('Contabilidad');

    const installButton = await screen.findByRole('button', { name: /Instalar/i });
    await user.click(installButton);

    await waitFor(() => {
      const queueRaw = localStorage.getItem('atlas-module-store-queue-v1');
      expect(queueRaw).toBeTruthy();
    });

    const queue = JSON.parse(localStorage.getItem('atlas-module-store-queue-v1') || '[]');
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({
      type: 'install',
      payload: expect.objectContaining({
        organizationId: 'org-e2e-web',
        moduleKey: 'accounting',
      }),
    });
    expect(installModuleMock).not.toHaveBeenCalled();
  });
});
