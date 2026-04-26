import { useCallback, useEffect, useMemo, useState } from "react";
import { env } from "../../config/env.js";

const STORAGE_KEY = "atlaserp.desktop.tasks.ui.v1";

const STATUS_OPTIONS = [
  "DRAFT",
  "IN_PROGRESS",
  "BLOCKED",
  "REVIEW",
  "CLOSED",
  "ARCHIVED",
];

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CATEGORY_OPTIONS = ["API", "WORKER", "DATABASE", "DESKTOP", "WEB", "DOCS", "INFRA", "OTHER"];
const DEPENDENCY_OPTIONS = ["BLOCKS", "RELATES"];

function unwrapApiResponse(payload) {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload;
}

function buildUrl(path, params) {
  const base = env.apiUrl.replace(/\/$/, "");
  const url = new URL(`${base}${path}`);

  if (params && typeof params === "object") {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function requestWithToken(path, { method = "GET", token, params, body } = {}) {
  const url = buildUrl(path, params);
  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`[TaskCatalog] ${method} ${path} -> ${response.status} ${errorText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  const json = await response.json();
  return unwrapApiResponse(json);
}

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistState(partial) {
  try {
    const current = loadPersistedState() ?? {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...partial }));
  } catch {
    // ignore
  }
}

function toDateInputValue(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function TaskCatalogDashboard({ session }) {
  const initialState = useMemo(() => loadPersistedState(), []);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskHistory, setTaskHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamMode, setStreamMode] = useState("polling");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    status: initialState?.filters?.status ?? "",
    priority: initialState?.filters?.priority ?? "",
    category: initialState?.filters?.category ?? "",
    moduleKey: initialState?.filters?.moduleKey ?? "",
    search: initialState?.filters?.search ?? "",
    includeArchived: initialState?.filters?.includeArchived ?? false,
  });
  const [createForm, setCreateForm] = useState({
    taskKey: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "OTHER",
    moduleKey: "",
  });
  const [statusDraft, setStatusDraft] = useState("DRAFT");
  const [statusReason, setStatusReason] = useState("");
  const [deadlineDraft, setDeadlineDraft] = useState("");
  const [assignDraft, setAssignDraft] = useState({
    assigneeUserId: "",
    assigneeRoleId: "",
  });
  const [dependencyDraft, setDependencyDraft] = useState({
    dependsOnTaskId: "",
    type: "BLOCKS",
  });

  const accessToken = session?.accessToken ?? null;

  const loadTasks = useCallback(
    async ({ preserveSelection = true } = {}) => {
      if (!accessToken) return;

      setLoading(true);
      setError(null);

      try {
        const [listData, summaryData] = await Promise.all([
          requestWithToken("/v1/tasks", {
            token: accessToken,
            params: {
              ...filters,
              includeArchived: filters.includeArchived ? "true" : undefined,
              limit: 100,
            },
          }),
          requestWithToken("/v1/tasks/summary", {
            token: accessToken,
            params: {
              ...filters,
              includeArchived: filters.includeArchived ? "true" : undefined,
            },
          }),
        ]);

        const nextItems = Array.isArray(listData?.items) ? listData.items : [];
        setItems(nextItems);
        setSummary(summaryData ?? null);

        if (!preserveSelection) {
          setSelectedTask(null);
          setTaskHistory([]);
          return;
        }

        const persistedTaskId = initialState?.lastViewedTaskId ?? null;
        const selectedTaskId = selectedTask?.id ?? persistedTaskId;
        if (!selectedTaskId) return;

        const stillExists = nextItems.some((item) => item.id === selectedTaskId);
        if (!stillExists) {
          setSelectedTask(null);
          setTaskHistory([]);
          persistState({ lastViewedTaskId: null });
          return;
        }

        const [detail, history] = await Promise.all([
          requestWithToken(`/v1/tasks/${selectedTaskId}`, { token: accessToken }),
          requestWithToken(`/v1/tasks/${selectedTaskId}/history`, { token: accessToken }),
        ]);

        setSelectedTask(detail ?? null);
        setTaskHistory(Array.isArray(history) ? history : []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : String(loadError));
      } finally {
        setLoading(false);
      }
    },
    [accessToken, filters, initialState?.lastViewedTaskId, selectedTask?.id],
  );

  const selectTask = useCallback(
    async (taskId) => {
      if (!accessToken) return;
      try {
        const [detail, history] = await Promise.all([
          requestWithToken(`/v1/tasks/${taskId}`, { token: accessToken }),
          requestWithToken(`/v1/tasks/${taskId}/history`, { token: accessToken }),
        ]);

        setSelectedTask(detail ?? null);
        setTaskHistory(Array.isArray(history) ? history : []);
        setStatusDraft(detail?.status ?? "DRAFT");
        setDeadlineDraft(toDateInputValue(detail?.deadlineAt));
        setAssignDraft({
          assigneeUserId: detail?.assigneeUserId ?? "",
          assigneeRoleId: detail?.assigneeRoleId ?? "",
        });

        persistState({ lastViewedTaskId: taskId });
      } catch (taskError) {
        setError(taskError instanceof Error ? taskError.message : String(taskError));
      }
    },
    [accessToken],
  );

  useEffect(() => {
    persistState({ filters });
  }, [filters]);

  useEffect(() => {
    if (!accessToken) {
      setItems([]);
      setSummary(null);
      setSelectedTask(null);
      setTaskHistory([]);
      return;
    }

    void loadTasks({ preserveSelection: true });
  }, [accessToken, loadTasks]);

  useEffect(() => {
    if (!accessToken) return undefined;

    const base = env.apiUrl.replace(/\/$/, "");
    const streamUrl = `${base}/v1/tasks/stream?access_token=${encodeURIComponent(accessToken)}`;

    let refreshTimer = null;
    const eventSource = new EventSource(streamUrl);

    eventSource.onopen = () => {
      setStreamMode("live");
    };

    eventSource.onmessage = () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      refreshTimer = setTimeout(() => {
        void loadTasks({ preserveSelection: true });
      }, 350);
    };

    eventSource.onerror = () => {
      setStreamMode("polling");
      eventSource.close();
    };

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      eventSource.close();
    };
  }, [accessToken, loadTasks]);

  useEffect(() => {
    if (!accessToken || streamMode === "live") return undefined;

    const interval = setInterval(() => {
      void loadTasks({ preserveSelection: true });
    }, 30_000);

    return () => clearInterval(interval);
  }, [accessToken, streamMode, loadTasks]);

  async function createTask(event) {
    event.preventDefault();
    if (!accessToken) return;

    try {
      await requestWithToken("/v1/tasks", {
        method: "POST",
        token: accessToken,
        body: {
          ...createForm,
          taskKey: createForm.taskKey.trim().toUpperCase(),
          title: createForm.title.trim(),
          description: createForm.description || undefined,
          moduleKey: createForm.moduleKey || undefined,
        },
      });

      setCreateForm({
        taskKey: "",
        title: "",
        description: "",
        priority: "MEDIUM",
        category: "OTHER",
        moduleKey: "",
      });
      setShowCreateForm(false);
      await loadTasks({ preserveSelection: true });
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : String(createError));
    }
  }

  async function updateSelectedStatus() {
    if (!accessToken || !selectedTask) return;

    try {
      await requestWithToken(`/v1/tasks/${selectedTask.id}`, {
        method: "PATCH",
        token: accessToken,
        body: {
          status: statusDraft,
          statusReason: statusReason || undefined,
        },
      });
      setStatusReason("");
      await selectTask(selectedTask.id);
      await loadTasks({ preserveSelection: true });
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : String(statusError));
    }
  }

  async function updateSelectedDeadline() {
    if (!accessToken || !selectedTask) return;

    try {
      await requestWithToken(`/v1/tasks/${selectedTask.id}`, {
        method: "PATCH",
        token: accessToken,
        body: {
          deadlineAt: deadlineDraft || null,
        },
      });
      await selectTask(selectedTask.id);
      await loadTasks({ preserveSelection: true });
    } catch (deadlineError) {
      setError(deadlineError instanceof Error ? deadlineError.message : String(deadlineError));
    }
  }

  async function assignSelectedTask() {
    if (!accessToken || !selectedTask) return;

    try {
      await requestWithToken(`/v1/tasks/${selectedTask.id}/assign`, {
        method: "POST",
        token: accessToken,
        body: {
          assigneeUserId: assignDraft.assigneeUserId || null,
          assigneeRoleId: assignDraft.assigneeRoleId || null,
        },
      });
      await selectTask(selectedTask.id);
      await loadTasks({ preserveSelection: true });
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : String(assignError));
    }
  }

  async function addDependency() {
    if (!accessToken || !selectedTask || !dependencyDraft.dependsOnTaskId) return;

    try {
      await requestWithToken(`/v1/tasks/${selectedTask.id}/dependencies`, {
        method: "POST",
        token: accessToken,
        body: {
          dependsOnTaskId: dependencyDraft.dependsOnTaskId.trim(),
          type: dependencyDraft.type,
        },
      });
      setDependencyDraft({ dependsOnTaskId: "", type: dependencyDraft.type });
      await selectTask(selectedTask.id);
      await loadTasks({ preserveSelection: true });
    } catch (dependencyError) {
      setError(dependencyError instanceof Error ? dependencyError.message : String(dependencyError));
    }
  }

  async function removeDependency(dependsOnTaskId) {
    if (!accessToken || !selectedTask) return;

    try {
      await requestWithToken(`/v1/tasks/${selectedTask.id}/dependencies/${dependsOnTaskId}`, {
        method: "DELETE",
        token: accessToken,
      });
      await selectTask(selectedTask.id);
      await loadTasks({ preserveSelection: true });
    } catch (dependencyError) {
      setError(dependencyError instanceof Error ? dependencyError.message : String(dependencyError));
    }
  }

  if (!accessToken) {
    return (
      <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Task Catalog Dashboard</h3>
        <p className="mt-1 text-xs text-slate-600">
          Inicia sesion para habilitar el panel de tareas unificadas.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Task Catalog Dashboard</h3>
          <p className="text-xs text-slate-500">
            Estado realtime: {streamMode === "live" ? "SSE activo" : "polling 30s"}
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          onClick={() => void loadTasks({ preserveSelection: true })}
        >
          Recargar
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-6">
        <select
          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
          value={filters.status}
          onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
        >
          <option value="">Estado</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
          value={filters.priority}
          onChange={(event) => setFilters((prev) => ({ ...prev, priority: event.target.value }))}
        >
          <option value="">Prioridad</option>
          {PRIORITY_OPTIONS.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
          value={filters.category}
          onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
        >
          <option value="">Categoria</option>
          {CATEGORY_OPTIONS.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
          placeholder="Modulo"
          value={filters.moduleKey}
          onChange={(event) => setFilters((prev) => ({ ...prev, moduleKey: event.target.value }))}
        />
        <input
          type="text"
          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
          placeholder="Buscar"
          value={filters.search}
          onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
        />
        <label className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-2 py-1 text-xs">
          <input
            type="checkbox"
            checked={filters.includeArchived}
            onChange={(event) => setFilters((prev) => ({ ...prev, includeArchived: event.target.checked }))}
          />
          Incluir archivadas
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-md bg-[--color-desktop-brand] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          onClick={() => setShowCreateForm((prev) => !prev)}
        >
          {showCreateForm ? "Cancelar" : "Crear task manual"}
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          onClick={() =>
            setFilters({
              status: "",
              priority: "",
              category: "",
              moduleKey: "",
              search: "",
              includeArchived: false,
            })
          }
        >
          Limpiar filtros
        </button>
      </div>

      {showCreateForm ? (
        <form className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-6" onSubmit={createTask}>
          <input
            type="text"
            required
            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            placeholder="TASK-KEY"
            value={createForm.taskKey}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, taskKey: event.target.value }))}
          />
          <input
            type="text"
            required
            className="rounded-md border border-slate-300 px-2 py-1 text-xs md:col-span-2"
            placeholder="Titulo"
            value={createForm.title}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))}
          />
          <select
            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            value={createForm.priority}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, priority: event.target.value }))}
          >
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            value={createForm.category}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, category: event.target.value }))}
          >
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            placeholder="Modulo (opcional)"
            value={createForm.moduleKey}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, moduleKey: event.target.value }))}
          />
          <textarea
            className="rounded-md border border-slate-300 px-2 py-1 text-xs md:col-span-6"
            placeholder="Descripcion"
            value={createForm.description}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <div className="md:col-span-6">
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
            >
              Guardar task
            </button>
          </div>
        </form>
      ) : null}

      {summary ? (
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-4">
          <div className="rounded-md bg-slate-50 p-2 text-xs">
            <p className="text-slate-500">Total</p>
            <p className="font-semibold text-slate-900">{summary.total ?? 0}</p>
          </div>
          {["byStatus", "byPriority", "byCategory"].map((bucket) => (
            <div key={bucket} className="rounded-md bg-slate-50 p-2 text-xs">
              <p className="text-slate-500">{bucket}</p>
              <p className="font-semibold text-slate-900">
                {Array.isArray(summary[bucket]) ? summary[bucket].length : 0} grupos
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-lg border border-slate-200">
          <div className="max-h-[440px] overflow-auto">
            <table className="min-w-full text-xs">
              <thead className="sticky top-0 bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-2 py-2 text-left">Task</th>
                  <th className="px-2 py-2 text-left">Estado</th>
                  <th className="px-2 py-2 text-left">Prioridad</th>
                  <th className="px-2 py-2 text-left">Modulo</th>
                  <th className="px-2 py-2 text-left">Vence</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50 ${
                      selectedTask?.id === item.id ? "bg-indigo-50" : ""
                    }`}
                    onClick={() => void selectTask(item.id)}
                  >
                    <td className="px-2 py-2">
                      <p className="font-semibold text-slate-900">{item.taskKey}</p>
                      <p className="text-slate-600">{item.title}</p>
                    </td>
                    <td className="px-2 py-2">{item.status}</td>
                    <td className="px-2 py-2">{item.priority}</td>
                    <td className="px-2 py-2">{item.moduleKey || "-"}</td>
                    <td className="px-2 py-2">{toDateInputValue(item.deadlineAt) || "-"}</td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td className="px-2 py-4 text-center text-slate-500" colSpan={5}>
                      Sin tasks para los filtros actuales.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          {!selectedTask ? (
            <p className="text-xs text-slate-500">Selecciona una task para ver detalle y acciones.</p>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500">{selectedTask.taskKey}</p>
                <h4 className="text-sm font-semibold text-slate-900">{selectedTask.title}</h4>
                <p className="mt-1 text-xs text-slate-600">{selectedTask.description || "Sin descripcion"}</p>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="rounded-md bg-slate-50 p-2">
                  <p className="text-slate-500">Estado actual</p>
                  <p className="font-semibold text-slate-900">{selectedTask.status}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-2">
                  <p className="text-slate-500">Fuente</p>
                  <p className="font-semibold text-slate-900">{selectedTask.source}</p>
                </div>
              </div>

              <div className="space-y-2 rounded-md border border-slate-200 p-2">
                <p className="text-xs font-semibold text-slate-700">Transicion de estado</p>
                <select
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={statusDraft}
                  onChange={(event) => setStatusDraft(event.target.value)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                  placeholder="Motivo (opcional)"
                  value={statusReason}
                  onChange={(event) => setStatusReason(event.target.value)}
                />
                <button
                  type="button"
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                  onClick={() => void updateSelectedStatus()}
                >
                  Actualizar estado
                </button>
              </div>

              <div className="space-y-2 rounded-md border border-slate-200 p-2">
                <p className="text-xs font-semibold text-slate-700">Fecha limite</p>
                <input
                  type="date"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={deadlineDraft}
                  onChange={(event) => setDeadlineDraft(event.target.value)}
                />
                <button
                  type="button"
                  className="rounded-md bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                  onClick={() => void updateSelectedDeadline()}
                >
                  Guardar fecha
                </button>
              </div>

              <div className="space-y-2 rounded-md border border-slate-200 p-2">
                <p className="text-xs font-semibold text-slate-700">Asignacion</p>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                  placeholder="assigneeUserId"
                  value={assignDraft.assigneeUserId}
                  onChange={(event) => setAssignDraft((prev) => ({ ...prev, assigneeUserId: event.target.value }))}
                />
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                  placeholder="assigneeRoleId"
                  value={assignDraft.assigneeRoleId}
                  onChange={(event) => setAssignDraft((prev) => ({ ...prev, assigneeRoleId: event.target.value }))}
                />
                <button
                  type="button"
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                  onClick={() => void assignSelectedTask()}
                >
                  Aplicar asignacion
                </button>
              </div>

              <div className="space-y-2 rounded-md border border-slate-200 p-2">
                <p className="text-xs font-semibold text-slate-700">Dependencias</p>
                <div className="max-h-24 space-y-1 overflow-auto">
                  {(selectedTask.dependencies ?? []).map((dependency) => (
                    <div key={dependency.id} className="flex items-center justify-between rounded bg-slate-50 px-2 py-1 text-xs">
                      <span>
                        {dependency.type}
                        {" -> "}
                        {dependency.dependsOn?.taskKey ?? dependency.dependsOnTaskId}
                      </span>
                      <button
                        type="button"
                        className="text-rose-600 hover:underline"
                        onClick={() => void removeDependency(dependency.dependsOnTaskId)}
                      >
                        quitar
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                  placeholder="dependsOnTaskId"
                  value={dependencyDraft.dependsOnTaskId}
                  onChange={(event) => setDependencyDraft((prev) => ({ ...prev, dependsOnTaskId: event.target.value }))}
                />
                <select
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={dependencyDraft.type}
                  onChange={(event) => setDependencyDraft((prev) => ({ ...prev, type: event.target.value }))}
                >
                  {DEPENDENCY_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
                  onClick={() => void addDependency()}
                >
                  Agregar dependencia
                </button>
              </div>

              <div className="space-y-1 rounded-md border border-slate-200 p-2">
                <p className="text-xs font-semibold text-slate-700">Historial de estado</p>
                <div className="max-h-24 overflow-auto text-xs text-slate-600">
                  {taskHistory.length === 0 ? (
                    <p>Sin historial.</p>
                  ) : (
                    taskHistory.map((entry) => (
                      <p key={entry.id}>
                        {entry.fromStatus || "NULL"}{" -> "}{entry.toStatus}{" | "}
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? <p className="mt-2 text-xs text-slate-500">Cargando tasks...</p> : null}
      {error ? <p className="mt-2 rounded-md bg-rose-50 p-2 text-xs text-rose-700">{error}</p> : null}
    </section>
  );
}

