import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "@/store/auth.store";
import { useApiError } from "@/hooks/useApiError";
import { useToast } from "@/components/ui/Toast";
import {
  useBankAccount,
  useCreateBankAccount,
  useUpdateBankAccount,
} from "@/modules/financial-operations/hooks/useBankAccounts";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useUnsavedChanges, useDirtyForm } from "@/modules/financial-operations/hooks/useFinOpsUx";
import { FinOpsLoadingState } from "@/modules/financial-operations/components/StateIndicators";
import { validateBankAccountForm } from "@/modules/financial-operations/validators";

/**
 * BankAccountFormPage — Formulario create/edit de cuenta bancaria.
 *
 * Ruta create: /financial-operations/bank-accounts/new
 * Ruta edit:   /financial-operations/bank-accounts/:id/edit
 *
 * Campos del formulario mapeados al CreateBankAccountDto / UpdateBankAccountDto:
 * - name (requerido, 3-120 chars)
 * - bankName (requerido, 2-120 chars)
 * - accountHolder (opcional, 2-120 chars)
 * - accountNumberMask (requerido, 4-40 chars)
 * - currencyCode (opcional, default MXN)
 * - currentBalance (opcional, default "0")
 */

const CURRENCY_OPTIONS = [
  { value: "MXN", label: "MXN — Peso mexicano" },
  { value: "USD", label: "USD — Dólar americano" },
  { value: "EUR", label: "EUR — Euro" },
];

const emptyForm = {
  name: "",
  bankName: "",
  accountHolder: "",
  accountNumberMask: "",
  currencyCode: "MXN",
  currentBalance: "0",
};

export default function BankAccountFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { toast } = useToast();

  // ── Data for edit mode ──
  const { data: existing, isLoading: loadingExisting } = useBankAccount(
    isEdit ? id : null,
  );

  const createMutation = useCreateBankAccount();
  const updateMutation = useUpdateBankAccount();

  const [initialForm, setInitialForm] = useState(emptyForm);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const { isDirty } = useDirtyForm(initialForm, form);
  useUnsavedChanges(isDirty);

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && existing) {
      const data = {
        name: existing.name ?? "",
        bankName: existing.bankName ?? "",
        accountHolder: existing.accountHolder ?? "",
        accountNumberMask: existing.accountNumberMask ?? "",
        currencyCode: existing.currencyCode ?? "MXN",
        currentBalance: existing.currentBalance ?? "0",
      };
      setForm(data);
      setInitialForm(data);
    }
  }, [isEdit, existing]);

  const handleChange = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = validateBankAccountForm(form);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: form });
        toast.success("Cuenta actualizada");
      } else {
        await createMutation.mutateAsync({
          ...form,
          organizationId,
          createdById: user?.id,
        });
        toast.success("Cuenta creada exitosamente");
      }
      // Marcar limpio para evitar warning al navegar
      setInitialForm(form);
      navigate("/financial-operations/bank-accounts");
    } catch (err) {
      handleError(err);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const breadcrumbs = [
    { label: "Tesorería" },
    { label: "Cuentas", to: "/financial-operations/bank-accounts" },
    { label: isEdit ? "Editar cuenta" : "Nueva cuenta" },
  ];

  if (isEdit && loadingExisting) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <FinOpsLoadingState message="Cargando datos de la cuenta..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          {isEdit ? "Editar cuenta bancaria" : "Nueva cuenta bancaria"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {isEdit
            ? "Actualiza los datos de la cuenta"
            : "Registra una nueva cuenta para gestionar movimientos financieros"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-4 md:p-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <Input
              label="Nombre de la cuenta"
              placeholder="Ej: Cuenta operativa BBVA"
              value={form.name}
              onChange={handleChange("name")}
              error={errors.name}
              required
            />
            <Input
              label="Banco"
              placeholder="Ej: BBVA, Banorte, HSBC"
              value={form.bankName}
              onChange={handleChange("bankName")}
              error={errors.bankName}
              required
            />
            <Input
              label="Titular"
              placeholder="Ej: Empresa S.A. de C.V."
              value={form.accountHolder}
              onChange={handleChange("accountHolder")}
              helpText="Opcional — nombre del titular de la cuenta"
            />
            <Input
              label="Número de cuenta (enmascarado)"
              placeholder="Ej: ****1234"
              value={form.accountNumberMask}
              onChange={handleChange("accountNumberMask")}
              error={errors.accountNumberMask}
              required
            />
            <Select
              label="Moneda"
              options={CURRENCY_OPTIONS}
              value={form.currencyCode}
              onValueChange={handleChange("currencyCode")}
              error={errors.currencyCode}
            />
            {!isEdit && (
              <Input
                label="Saldo inicial"
                placeholder="0.00"
                value={form.currentBalance}
                onChange={handleChange("currentBalance")}
                helpText="Saldo actual de la cuenta al momento de registrarla"
                className="font-mono"
              />
            )}
          </div>

          {/* Footer con acciones */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-border flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/financial-operations/bank-accounts")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
            >
              {isSaving
                ? "Guardando..."
                : isEdit
                  ? "Guardar cambios"
                  : "Crear cuenta"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
