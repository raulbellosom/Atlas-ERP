import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import {
  useMovement,
  useCreateMovement,
  useUpdateMovement,
} from '@/modules/financial-operations/hooks/useMovements';
import { useBankAccounts } from '@/modules/financial-operations/hooks/useBankAccounts';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { useUnsavedChanges, useDirtyForm } from '@/modules/financial-operations/hooks/useFinOpsUx';
import { FinOpsLoadingState } from '@/modules/financial-operations/components/StateIndicators';
import { validateMovementForm } from '@/modules/financial-operations/validators';

/**
 * MovementFormPage — Formulario para crear movimiento manual.
 *
 * Campos: bankAccountId, movementType, amount, currencyCode, occurredAt,
 *         description, reference, status.
 */

const TYPE_OPTIONS = [
  { value: 'INCOME', label: 'Ingreso' },
  { value: 'EXPENSE', label: 'Egreso' },
  { value: 'ADJUSTMENT', label: 'Ajuste' },
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'POSTED', label: 'Publicado' },
  { value: 'CANCELED', label: 'Cancelado' },
  { value: 'REVERSED', label: 'Revertido' },
];

const CURRENCY_OPTIONS = [
  { value: 'MXN', label: 'MXN' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
];

const emptyForm = {
  bankAccountId: '',
  movementType: 'EXPENSE',
  amount: '', // Este será el monto en la moneda de la cuenta
  originalAmount: '', // Monto en la divisa original (si aplica)
  exchangeRate: '', // Tipo de cambio (si aplica)
  currencyCode: 'MXN',
  occurredAt: new Date().toISOString().slice(0, 10),
  description: '',
  reference: '',
  status: 'DRAFT',
};

export default function MovementFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { toast } = useToast();

  const { data: existing, isLoading: loadingExisting } = useMovement(isEdit ? id : null);
  const { data: bankAccounts = [] } = useBankAccounts(organizationId);

  const createMutation = useCreateMovement();
  const updateMutation = useUpdateMovement();

  const [initialForm, setInitialForm] = useState(emptyForm);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const { isDirty } = useDirtyForm(initialForm, form);
  useUnsavedChanges(isDirty);

  useEffect(() => {
    if (isEdit && existing) {
      const data = {
        bankAccountId: existing.bankAccountId ?? '',
        movementType: existing.movementType ?? 'EXPENSE',
        amount: String(existing.amount ?? ''),
        originalAmount: existing.originalAmount ? String(existing.originalAmount) : '',
        exchangeRate: existing.exchangeRate ? String(existing.exchangeRate) : '',
        status: existing.status ? String(existing.status).toUpperCase() : 'DRAFT',
        currencyCode: existing.currencyCode ? String(existing.currencyCode).toUpperCase() : 'MXN',
        occurredAt: existing.occurredAt ? existing.occurredAt.slice(0, 10) : '',
        description: existing.description ?? '',
        reference: existing.reference ?? '',
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
    const errs = validateMovementForm(form);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        ...form,
        occurredAt: new Date(form.occurredAt).toISOString(),
        description: form.description?.trim() ? form.description.trim() : undefined,
        reference: form.reference?.trim() ? form.reference.trim() : undefined,
        exchangeRate: form.exchangeRate ? String(form.exchangeRate) : undefined,
        originalAmount: form.originalAmount ? String(form.originalAmount) : undefined,
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success('Movimiento actualizado');
      } else {
        await createMutation.mutateAsync({
          ...payload,
          organizationId,
          createdById: user?.id,
        });
        toast.success('Movimiento registrado');
      }
      setInitialForm(form);
      navigate('/financial-operations/movements');
    } catch (err) {
      handleError(err);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const accountOptions = bankAccounts
    .filter((a) => a.isActive || (isEdit && a.id === form.bankAccountId))
    .map((a) => ({ value: a.id, label: `${a.name} — ${a.bankName} (${a.currencyCode})` }));

  const selectedAccount = bankAccounts.find((a) => a.id === form.bankAccountId);
  const showExchange = selectedAccount && form.currencyCode !== selectedAccount.currencyCode;

  const breadcrumbs = [
    { label: 'Tesorería' },
    { label: 'Movimientos', to: '/financial-operations/movements' },
    { label: isEdit ? 'Editar' : 'Nuevo movimiento' },
  ];

  if (isEdit && loadingExisting) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <FinOpsLoadingState message="Cargando datos del movimiento..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          {isEdit ? 'Editar movimiento' : 'Nuevo movimiento'}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Registra un ingreso, egreso o ajuste manual
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-4 md:p-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <Select
              label="Cuenta bancaria"
              placeholder="Selecciona cuenta..."
              options={accountOptions}
              value={form.bankAccountId}
              onValueChange={handleChange('bankAccountId')}
              error={errors.bankAccountId}
              required
            />
            <Select
              label="Tipo de movimiento"
              options={TYPE_OPTIONS}
              value={form.movementType}
              onValueChange={handleChange('movementType')}
            />
            <Input
              label={
                showExchange ? `Monto (en ${selectedAccount?.currencyCode || 'MXN'})` : 'Monto'
              }
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange('amount')}
              error={errors.amount}
              required
              className="font-mono"
            />
            <Select
              label="Moneda del movimiento"
              options={CURRENCY_OPTIONS}
              value={form.currencyCode}
              onValueChange={handleChange('currencyCode')}
              helpText="Divisa de la transacción original"
            />
            {showExchange && (
              <>
                <Input
                  label="Tipo de cambio"
                  placeholder="Ej: 20.50"
                  value={form.exchangeRate}
                  onChange={handleChange('exchangeRate')}
                  className="font-mono"
                  required
                />
                <Input
                  label={`Monto original (en ${form.currencyCode})`}
                  placeholder="0.00"
                  value={form.originalAmount}
                  onChange={handleChange('originalAmount')}
                  className="font-mono"
                  required
                />
              </>
            )}
            <Input
              label="Fecha"
              type="date"
              value={form.occurredAt}
              onChange={handleChange('occurredAt')}
              error={errors.occurredAt}
              required
            />
            <Select
              label="Estado"
              options={STATUS_OPTIONS}
              value={form.status}
              onValueChange={handleChange('status')}
            />
            <Input
              label="Referencia"
              placeholder="Ej: TRANS-001, factura 123"
              value={form.reference}
              onChange={handleChange('reference')}
              helpText="Opcional — identificador externo"
            />
            <div className="md:col-span-2">
              <Textarea
                label="Descripción"
                placeholder="Describe brevemente este movimiento..."
                value={form.description}
                onChange={handleChange('description')}
                rows={3}
              />
            </div>
          </div>

          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-border flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/financial-operations/movements')}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar movimiento'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
