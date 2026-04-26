import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModuleStoreDesktopPanel } from "./ModuleStoreDesktopPanel.jsx";

const desktopApiGetMock = vi.fn();
const desktopApiPostMock = vi.fn();
const enqueueLifecycleOperationMock = vi.fn();
const listLifecycleQueueMock = vi.fn();
const runLifecycleCycleMock = vi.fn();

vi.mock("../../api/client.js", () => ({
  desktopApiClient: {
    get: (...args) => desktopApiGetMock(...args),
    post: (...args) => desktopApiPostMock(...args),
  },
}));

vi.mock("./moduleStoreOfflineQueue.js", () => ({
  enqueueModuleStoreLifecycleOperation: (...args) => enqueueLifecycleOperationMock(...args),
  listModuleStoreLifecycleQueue: (...args) => listLifecycleQueueMock(...args),
}));

vi.mock("./moduleStoreLifecycleWorker.js", () => ({
  runModuleStoreLifecycleCycle: (...args) => runLifecycleCycleMock(...args),
}));

function buildCatalogFixture() {
  return [
    {
      moduleKey: "accounting",
      name: "Accounting",
      description: "Modulo contable",
      isCore: false,
      versions: [
        { version: "1.1.0", compatibilityRange: "^1.0.0" },
        { version: "1.0.0", compatibilityRange: "^1.0.0" },
      ],
    },
    {
      moduleKey: "core-platform",
      name: "Core Platform",
      description: "Nucleo",
      isCore: true,
      versions: [{ version: "1.0.0", compatibilityRange: "^1.0.0" }],
    },
  ];
}

describe("ModuleStoreDesktopPanel e2e UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    listLifecycleQueueMock.mockResolvedValue([]);
    runLifecycleCycleMock.mockResolvedValue({
      skipped: false,
      reason: "empty",
      applied: 0,
      reconciled: 0,
      failed: 0,
    });

    desktopApiGetMock.mockImplementation(async (path) => {
      if (path === "/v1/module-store/catalog") {
        return buildCatalogFixture();
      }
      if (path === "/v1/module-store/installed") {
        return [];
      }
      throw new Error(`Ruta get no mockeada: ${path}`);
    });

    desktopApiPostMock.mockImplementation(async (path) => {
      if (
        path === "/v1/module-store/install" ||
        path === "/v1/module-store/uninstall" ||
        path === "/v1/module-store/upgrade"
      ) {
        return { id: "job-desktop-e2e-1", status: "COMPLETED" };
      }
      throw new Error(`Ruta post no mockeada: ${path}`);
    });

    enqueueLifecycleOperationMock.mockResolvedValue({
      accepted: true,
      reason: "queued",
      queueItemId: 1,
      payload: {},
    });
  });

  it("ejecuta install online desde la UI desktop", async () => {
    const user = userEvent.setup();
    render(
      <ModuleStoreDesktopPanel isOnline defaultOrganizationId="org-desktop-e2e-online" />,
    );

    await screen.findByText("Accounting");
    const installButton = await screen.findByRole("button", { name: /Instalar/i });
    await user.click(installButton);

    await waitFor(() => {
      expect(desktopApiPostMock).toHaveBeenCalledTimes(1);
    });

    expect(desktopApiPostMock).toHaveBeenCalledWith(
      "/v1/module-store/install",
      expect.objectContaining({
        organizationId: "org-desktop-e2e-online",
        moduleKey: "accounting",
        version: "1.1.0",
      }),
    );
    expect(enqueueLifecycleOperationMock).not.toHaveBeenCalled();
  });

  it("sincroniza operaciones pendientes de cola al reconectar", async () => {
    const queueCounts = [];
    listLifecycleQueueMock.mockResolvedValueOnce([
      {
        id: 9,
        operation: "install",
        status: "pending",
        attempts: 0,
        priority: 80,
        payload: { organizationId: "org-desktop-queue", moduleKey: "accounting", version: "1.0.0" },
      },
    ]);
    listLifecycleQueueMock.mockResolvedValue([]);

    render(
      <ModuleStoreDesktopPanel
        isOnline
        defaultOrganizationId="org-desktop-queue"
        onQueueCountChange={(count) => queueCounts.push(count)}
      />,
    );

    await waitFor(() => {
      expect(runLifecycleCycleMock).toHaveBeenCalledTimes(1);
    });

    expect(runLifecycleCycleMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isOnline: true,
      }),
    );
    expect(queueCounts.some((count) => count >= 1)).toBe(true);
  });
});
