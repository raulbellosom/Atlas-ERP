/**
 * CreateMovementFormDesktop — formulario de movimiento financiero para desktop.
 *
 * Persiste el borrador en SQLite con useFormDraft.
 * Puede operar offline: el movimiento se encola en sync queue (T-1507).
 *
 * Task origen: T-1506 (Fase 15 Bloque 2)
 */

import { useFormDraft } from "../../modules/finops/hooks/useFormDraft.js";

const INITIAL = {
  bankAccountId: "",
  amount: "",
  currency: "MXN",
  type: "EXPENSE",
  movementDate: new Date().toISOString().slice(0, 10),
  description: "",
};

function DraftBanner({ onDiscard }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
      <span>📄 Tienes un borrador guardado.</span>
      <button
        type="button"
        onClick={onDiscard}
        className="ml-4 text-xs font-medium underline hover:no-underline"
      >
        Descartar
      </button>
    </div>
  );
}

/**
 * @param {{
 *   bankAccounts: Array<{id:string, name:string}>,
 *   onSubmit: (values: object) => Promise<void>,
 *   isOffline: boolean,
 * }} props
 */
export default function CreateMovementFormDesktop({ bankAccounts = [], onSubmit, isOffline }) {
  const { values, hasDraft, draftLoaded, updateField, discardDraft, clearDraftOnSuccess } =
    useFormDraft("movement", INITIAL);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!onSubmit) return;
    await onSubmit({ ...values, amount: parseFloat(values.amount) || 0 });
    await clearDraftOnSuccess();
  }

  if (!draftLoaded) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {hasDraft && <DraftBanner onDiscard={discardDraft} />}

      {isOffline && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          ⚠️ Modo offline — el movimiento se encolará para sincronizar al reconectar.
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">Cuenta bancaria</label>
        <select
          required
          value={values.bankAccountId}
          onChange={(e) => updateField("bankAccountId", e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar cuenta…</option>
          {bankAccounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Monto</label>
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            value={values.amount}
            onChange={(e) => updateField("amount", e.target.value)}
            placeholder="0.00"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Moneda</label>
          <select
            value={values.currency}
            onChange={(e) => updateField("currency", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>MXN</option>
            <option>USD</option>
            <option>EUR</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Tipo</label>
          <select
            value={values.type}
            onChange={(e) => updateField("type", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="EXPENSE">Egreso</option>
            <option value="INCOME">Ingreso</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Fecha</label>
          <input
            type="date"
            required
            value={values.movementDate}
            onChange={(e) => updateField("movementDate", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Descripción</label>
        <textarea
          rows={2}
          value={values.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Descripción del movimiento…"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isOffline ? "Guardar (offline)" : "Guardar movimiento"}
      </button>
    </form>
  );
}
