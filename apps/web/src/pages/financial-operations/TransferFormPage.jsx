import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/auth.store";
import { useApiError } from "@/hooks/useApiError";
import { useToast } from "@/components/ui/Toast";
import { useCreateTransfer } from "@/modules/financial-operations/hooks/useTransfers";
import { useBankAccounts } from "@/modules/financial-operations/hooks/useBankAccounts";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useUnsavedChanges, useDirtyForm } from "@/modules/financial-operations/hooks/useFinOpsUx";
import { validateTransferForm } from "@/modules/financial-operations/validators";

/**
 * TransferFormPage — Formulario de transferencia entre cuentas bancarias.
 *
 * Campos: fromBankAccountId, toBankAccountId, amount, currencyCode,
 *         occurredAt, description, reference.
 */

const CURRENCY_OPTIONS = [
  { value: "MXN", label: "MXN" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

export default function TransferFormPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { toast } = useToast();

  const { data: bankAccounts = [] } = useBankAccounts(organizationId);
  const createMutation = useCreateTransfer();

  const initialEmpty = {
    fromBankAccountId: "",
    toBankAccountId: "",
    amount: "",
    currencyCode: "MXN",
    occurredAt: new Date().toISOString().slice(0, 10),
    description: "",
    reference: "",
  };

  const [initialForm, setInitialForm] = useState(initialEmpty);
  const [form, setForm] = useState(initialEmpty);
  const [errors, setErrors] = useState({});

  const { isDirty } = useDirtyForm(initialForm, form);
  useUnsavedChanges(isDirty);

  const handleChange = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = validateTransferForm(form);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        ...form,
        occurredAt: new Date(form.occurredAt).toISOString(),
        organizationId,
        initiatedById: user?.id,
      });
      toast.success("Transferencia registrada");
      setInitialForm(form);
      navigate("/financial-operations/movements");
    } catch (err) {
      handleError(err);
    }
  };

  const activeAccounts = bankAccounts.filter((a) => a.isActive);
  const accountOptions = activeAccounts.map((a) => ({
    value: a.id,
    label: `${a.name} — ${a.bankName} (${a.accountNumberMask})`,
  }));

  const breadcrumbs = [
    { label: "Tesorería" },
    { label: "Movimientos", to: "/financial-operations/movements" },
    { label: "Nueva transferencia" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Nueva transferencia
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Mueve fondos entre dos cuentas bancarias de la organización
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-4 md:p-6 space-y-6">
            {/* Cuentas */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              <Select
                label="Cuenta origen"
                placeholder="Selecciona cuenta..."
                options={accountOptions}
                value={form.fromBankAccountId}
                onValueChange={handleChange("fromBankAccountId")}
                error={errors.fromBankAccountId}
                required
              />
              <Select
                label="Cuenta destino"
                placeholder="Selecciona cuenta..."
                options={accountOptions}
                value={form.toBankAccountId}
                onValueChange={handleChange("toBankAccountId")}
                error={errors.toBankAccountId}
                required
              />
            </div>

            {/* Separador visual — flecha de transferencia */}
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center gap-2 text-text-disabled">
                <div className="h-px w-12 bg-border" />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
                <div className="h-px w-12 bg-border" />
              </div>
            </div>

            {/* Detalles */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              <Input
                label="Monto"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange("amount")}
                error={errors.amount}
                required
                className="font-mono"
              />
              <Select
                label="Moneda"
                options={CURRENCY_OPTIONS}
                value={form.currencyCode}
                onValueChange={handleChange("currencyCode")}
              />
              <Input
                label="Fecha"
                type="date"
                value={form.occurredAt}
                onChange={handleChange("occurredAt")}
                error={errors.occurredAt}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              <Input
                label="Referencia"
                placeholder="Ej: TRF-001"
                value={form.reference}
                onChange={handleChange("reference")}
                helpText="Opcional"
              />
              <Textarea
                label="Descripción"
                placeholder="Describe esta transferencia..."
                value={form.description}
                onChange={handleChange("description")}
                rows={2}
              />
            </div>
          </div>

          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-border flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate("/financial-operations/movements")}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Registrando..." : "Registrar transferencia"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
