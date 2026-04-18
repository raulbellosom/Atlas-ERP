import { useEffect, useMemo, useState } from "react";
import {
  CONFLICT_ACTIONS,
  isConflictCandidate,
  resolveSyncConflictAction,
} from "../../modules/sync/localConflictResolutionService.js";

function formatJson(value) {
  if (!value) return "—";
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function parseJsonEditorValue(rawValue) {
  if (!rawValue || rawValue.trim().length === 0) {
    throw new Error("El payload de merge manual no puede estar vacío.");
  }
  return JSON.parse(rawValue);
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "medium",
    });
  } catch {
    return iso;
  }
}

/**
 * T-1034 + T-1035..T-1038 + T-1039:
 * Panel de detalle de conflictos con acciones de resolución y control de permisos.
 */
export function ConflictDetailPanel({
  item,
  onClose,
  onResolved,
  canResolve = false,
  permissionMessage = "",
}) {
  const open = Boolean(item);
  const conflictCandidate = isConflictCandidate(item);

  const [reason, setReason] = useState("");
  const [showMergeEditor, setShowMergeEditor] = useState(false);
  const [mergedPayloadText, setMergedPayloadText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const defaultMergeJson = useMemo(() => formatJson(item?.payloadJson), [item]);

  useEffect(() => {
    setReason("");
    setShowMergeEditor(false);
    setMergedPayloadText(defaultMergeJson === "—" ? "{}" : defaultMergeJson);
    setActionError("");
  }, [defaultMergeJson, item?.id]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleResolve(action) {
    if (!item || isSubmitting) return;
    if (!canResolve) {
      setActionError(permissionMessage || "Tu usuario no tiene permiso para resolver conflictos.");
      return;
    }

    setIsSubmitting(true);
    setActionError("");

    try {
      const mergedPayload =
        action === CONFLICT_ACTIONS.MERGE_MANUAL
          ? parseJsonEditorValue(mergedPayloadText)
          : null;

      await resolveSyncConflictAction({
        item,
        action,
        reason: reason.trim() || null,
        mergedPayload,
      });

      onResolved?.({ item, action });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Detalle de conflicto de sincronización"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Detalle de conflicto
            </p>
            <h3 className="mt-0.5 text-sm font-semibold text-slate-900">
              {item?.entity ?? "—"} / {item?.entityId ?? "—"}
            </h3>
          </div>
          <button
            type="button"
            aria-label="Cerrar panel"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Metadatos
            </h4>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-slate-50 p-3 text-xs">
              <div>
                <dt className="text-slate-400">Operación</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{item?.operation ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Estado</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{item?.status ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Aprobación</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{item?.approvalStatus ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Intentos</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{item?.attempts ?? 0}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Creado</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{formatDate(item?.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Retry at</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{formatDate(item?.retryAt)}</dd>
              </div>
            </dl>
          </section>

          {item?.lastError && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-600">
                Error del backend
              </h4>
              <pre className="whitespace-pre-wrap break-all rounded-lg border border-rose-100 bg-rose-50 p-3 text-xs text-rose-700">
                {item.lastError}
              </pre>
            </section>
          )}

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Payload local
            </h4>
            <pre className="whitespace-pre-wrap break-all rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              {formatJson(item?.payloadJson)}
            </pre>
          </section>

          {item?.idempotencyKey && (
            <section>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Clave de idempotencia
              </h4>
              <p className="break-all rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">
                {item.idempotencyKey}
              </p>
            </section>
          )}

          {conflictCandidate && (
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Resolver conflicto
              </h4>
              <p className="text-xs text-slate-500">
                Selecciona una acción para cerrar este conflicto local y registrar la decisión.
              </p>

              {!canResolve && (
                <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700">
                  {permissionMessage || "No tienes permiso para resolver conflictos."}
                </p>
              )}

              <label className="mt-3 block text-xs text-slate-600" htmlFor="conflict-resolution-reason">
                Razón (opcional)
              </label>
              <input
                id="conflict-resolution-reason"
                type="text"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Ej. validado con gerente de operaciones"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-300"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isSubmitting || !canResolve}
                  className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => handleResolve(CONFLICT_ACTIONS.APPROVE_LOCAL)}
                >
                  Aprobar local
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !canResolve}
                  className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => handleResolve(CONFLICT_ACTIONS.KEEP_SERVER)}
                >
                  Conservar servidor
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !canResolve}
                  className="rounded-md bg-rose-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => handleResolve(CONFLICT_ACTIONS.DISCARD_LOCAL)}
                >
                  Descartar local
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !canResolve}
                  className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setShowMergeEditor((prev) => !prev)}
                >
                  {showMergeEditor ? "Ocultar merge manual" : "Merge manual"}
                </button>
              </div>

              {showMergeEditor && (
                <div className="mt-3 space-y-2">
                  <label className="block text-xs text-slate-600" htmlFor="merge-manual-payload">
                    Payload merge manual (JSON)
                  </label>
                  <textarea
                    id="merge-manual-payload"
                    value={mergedPayloadText}
                    onChange={(event) => setMergedPayloadText(event.target.value)}
                    rows={8}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 font-mono text-xs text-slate-700 outline-none focus:border-indigo-300"
                  />
                  <button
                    type="button"
                    disabled={isSubmitting || !canResolve}
                    className="rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => handleResolve(CONFLICT_ACTIONS.MERGE_MANUAL)}
                  >
                    Confirmar merge manual
                  </button>
                </div>
              )}

              {actionError && (
                <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs text-rose-700">
                  {actionError}
                </p>
              )}
            </section>
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-3">
          <button
            type="button"
            className="w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </aside>
    </>
  );
}

