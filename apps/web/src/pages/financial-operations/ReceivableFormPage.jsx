import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import {
  useReceivable,
  useCreateReceivable,
  useUpdateReceivable,
} from '@/modules/financial-operations/hooks/useCxcCxp';
import { useBankAccounts } from '@/modules/financial-operations/hooks/useBankAccounts';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { useUnsavedChanges, useDirtyForm } from '@/modules/financial-operations/hooks/useFinOpsUx';
import { FinOpsLoadingState } from '@/modules/financial-operations/components/StateIndicators';

/**
 * ReceivableFormPage — Formulario para crear/editar una CxC.
 */

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Abierto' },
  { value: 'PARTIALLY_PAID', label: 'Parcialmente pagado' },
  { value: 'PAID', label: 'Pagado' },
  { value: 'OVERDUE', label: 'Vencido' },
  { value: 'CANCELED', label: 'Cancelado' },
];

const CURRENCY_OPTIONS = [
  { value: 'MXN', label: 'MXN' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
];

const emptyForm = {
  bankAccountId: '',
  reference: '',
  externalReference: '',
  amount: '',
  amountPaid: '0',
  currencyCode: 'MXN',
  issuedAt: new Date().toISOString().slice(0, 10),
  dueAt: '',
  description: '',
  status: 'OPEN',
};

export default function ReceivableFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { toast } = useToast();

  const { data: existing, isLoading: loadingExisting } = useReceivable(isEdit ? id : null);
  const { data: bankAccounts = [] } = useBankAccounts(organizationId);

  const createMutation = useCreateReceivable();
  const updateMutation = useUpdateReceivable();

  const [initialForm, setInitialForm] = useState(emptyForm);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const { isDirty } = useDirtyForm(initialForm, form);
  useUnsavedChanges(isDirty);

  useEffect(() => {
    if (isEdit && existing) {
      const data = {
        bankAccountId: existing.bankAccountId ?? '',
        reference: existing.reference ?? '',
        externalReference: existing.externalReference ?? '',
        amount: String(existing.amount ?? ''),
        amountPaid: String(existing.amountPaid ?? '0'),
        currencyCode: existing.currencyCode ?? 'MXN',
        issuedAt: existing.issuedAt ? existing.issuedAt.slice(0, 10) : '',
        dueAt: existing.dueAt ? existing.dueAt.slice(0, 10) : '',
        description: existing.description ?? '',
        status: existing.status ?? 'OPEN',
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
    const errs = {};
    if (!form.amount || parseFloat(form.amount) <= 0) {
      errs.amount = 'El monto debe ser mayor a 0';
    }
    if (!form.issuedAt) {
      errs.issuedAt = 'La fecha de emisión es obligatoria';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        ...form,
        issuedAt: form.issuedAt ? new Date(form.issuedAt).toISOString() : undefined,
        dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
        description: form.description?.trim() || undefined,
        reference: form.reference?.trim() || undefined,
        externalReference: form.externalReference?.trim() || undefined,
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success('Cuenta por cobrar actualizada');
      } else {
        await createMutation.mutateAsync({
          ...payload,
          organizationId,
          createdById: user?.id,
        });
        toast.success('Cuenta por cobrar registrada');
      }
      setInitialForm(form);
      navigate('/financial-operations/receivables');
    } catch (err) {
      handleError(err);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const accountOptions = [
    { value: '', label: 'Sin cuenta asociada' },
    ...bankAccounts
      .filter((a) => a.isActive)
      .map((a) => ({
        value: a.id,
        label: `${a.name} — ${a.bankName}`,
      })),
  ];

  const breadcrumbs = [
    { label: 'Tesorería' },
    { label: 'Cuentas por cobrar', to: '/financial-operations/receivables' },
    { label: isEdit ? 'Editar' : 'Nueva CxC' },
  ];

  if (isEdit && loadingExisting) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <FinOpsLoadingState message="Cargando datos de la CxC..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          {isEdit ? 'Editar cuenta por cobrar' : 'Nueva cuenta por cobrar'}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Registra un cobro pendiente a un cliente o tercero
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-4 md:p-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <Input
              label="Referencia"
              placeholder="Ej: FAC-001"
              value={form.reference}
              onChange={handleChange('reference')}
              helpText="Identificador interno"
            />
            <Input
              label="Referencia externa"
              placeholder="Ej: UUID factura SAT"
              value={form.externalReference}
              onChange={handleChange('externalReference')}
              helpText="Opcional"
            />
            <Input
              label="Monto"
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange('amount')}
              error={errors.amount}
              required
              className="font-mono"
            />
            <Select
              label="Moneda"
              options={CURRENCY_OPTIONS}
              value={form.currencyCode}
              onValueChange={handleChange('currencyCode')}
            />
            <Input
              label="Fecha de emisión"
              type="date"
              value={form.issuedAt}
              onChange={handleChange('issuedAt')}
              error={errors.issuedAt}
              required
            />
            <Input
              label="Fecha de vencimiento"
              type="date"
              value={form.dueAt}
              onChange={handleChange('dueAt')}
              helpText="Opcional"
            />
            <Select
              label="Cuenta bancaria"
              options={accountOptions}
              value={form.bankAccountId}
              onValueChange={handleChange('bankAccountId')}
              helpText="Cuenta donde se espera recibir el pago"
            />
            <Select
              label="Estado"
              options={STATUS_OPTIONS}
              value={form.status}
              onValueChange={handleChange('status')}
            />
            {isEdit && (
              <Input
                label="Monto pagado"
                placeholder="0.00"
                value={form.amountPaid}
                onChange={handleChange('amountPaid')}
                className="font-mono"
                helpText="Monto acumulado de pagos recibidos"
              />
            )}
            <div className={isEdit ? '' : 'md:col-span-2'}>
              <Textarea
                label="Descripción"
                placeholder="Describe esta cuenta por cobrar..."
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
              onClick={() => navigate('/financial-operations/receivables')}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar CxC'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
