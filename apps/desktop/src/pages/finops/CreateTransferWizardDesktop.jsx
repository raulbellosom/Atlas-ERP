/**
 * CreateTransferWizardDesktop — wizard de 2 pasos para transferencia entre cuentas.
 *
 * Paso 1: selección de cuentas + monto + fecha.
 * Paso 2: confirmación + submit.
 * El estado de cada paso se persiste en SQLite con useFormDraft('transfer').
 *
 * Task origen: T-1506 (Fase 15 Bloque 2)
 */

import { useState } from "react";
import { useFormDraft } from "../../modules/finops/hooks/useFormDraft.js";

const INITIAL = {
  fromAccountId: "",
  toAccountId: "",
  amount: "",
  currency: "MXN",
  transferDate: new Date().toISOString().slice(0, 10),
  description: "",
};

function DraftBanner({ onDiscard }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
      <span>📄 Tienes un borrador guardado.</span>
      <button type="button" onClick={onDiscard} className="ml-4 text-xs font-medium underline hover:no-underline">
        Descartar
      </button>
    </div>
  );
}

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
            i < current
              ? "bg-blue-600 text-white"
              : i === current
              ? "border-2 border-blue-600 text-blue-600"
              : "border border-slate-300 text-slate-400"
          }`}
        >
          {i + 1}
        </span>
      ))}
      <span>Paso {current + 1} de {total}</span>
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
export default function CreateTransferWizardDesktop({ bankAccounts = [], onSubmit, isOffline }) {
  const [step, setStep] = useState(0);
  const { values, hasDraft, draftLoaded, updateField, discardDraft, clearDraftOnSuccess } =
    useFormDraft("transfer", INITIAL);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!onSubmit) return;
    await onSubmit({ ...values, amount: parseFloat(values.amount) || 0 });
    await clearDraftOnSuccess();
    setStep(0);
  }

  if (!draftLoaded) return null;

  const fromAccount = bankAccounts.find((a) => a.id === values.fromAccountId);
  const toAccount = bankAccounts.find((a) => a.id === values.toAccountId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <StepIndicator current={step} total={2} />

      {hasDraft && <DraftBanner onDiscard={() => { discardDraft(); setStep(0); }} />}

      {isOffline && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          ⚠️ Modo offline — la transferencia se encolará para sincronizar al reconectar.
        </p>
      )}

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Cuenta origen</label>
            <select
              required
              value={values.fromAccountId}
              onChange={(e) => updateField("fromAccountId", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar cuenta origen…</option>
              {bankAccounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Cuenta destino</label>
            <select
              required
              value={values.toAccountId}
              onChange={(e) => updateField("toAccountId", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar cuenta destino…</option>
              {bankAccounts
                .filter((a) => a.id !== values.fromAccountId)
                .map((a) => (
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

          <div>
            <label className="block text-sm font-medium text-slate-700">Fecha</label>
            <input
              type="date"
              required
              value={values.transferDate}
              onChange={(e) => updateField("transferDate", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            disabled={!values.fromAccountId || !values.toAccountId || !values.amount}
            onClick={() => setStep(1)}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Siguiente →
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-semibold text-slate-700">Confirmación de transferencia</p>
            <dl className="mt-3 space-y-2 text-slate-600">
              <div className="flex justify-between">
                <dt>Origen</dt>
                <dd className="font-medium text-slate-900">{fromAccount?.name ?? values.fromAccountId}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Destino</dt>
                <dd className="font-medium text-slate-900">{toAccount?.name ?? values.toAccountId}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Monto</dt>
                <dd className="font-semibold text-slate-900">
                  {new Intl.NumberFormat("es-MX", { style: "currency", currency: values.currency }).format(
                    parseFloat(values.amount) || 0,
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Fecha</dt>
                <dd className="text-slate-900">{values.transferDate}</dd>
              </div>
            </dl>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ← Atrás
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {isOffline ? "Confirmar (offline)" : "Confirmar transferencia"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
