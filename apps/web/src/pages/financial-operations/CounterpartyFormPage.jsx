import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import {
  useCounterparty,
  useCreateCounterparty,
  useUpdateCounterparty,
} from '@/modules/financial-operations/hooks/useCounterparties';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { FinOpsLoadingState } from '@/modules/financial-operations/components/StateIndicators';

const TYPE_OPTIONS = [
  { value: 'CUSTOMER', label: 'Cliente' },
  { value: 'VENDOR', label: 'Proveedor' },
  { value: 'EMPLOYEE', label: 'Empleado' },
  { value: 'OTHER', label: 'Otro' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'INACTIVE', label: 'Inactivo' },
  { value: 'SUSPENDED', label: 'Suspendido' },
];

const emptyForm = {
  name: '',
  displayName: '',
  type: 'CUSTOMER',
  status: 'ACTIVE',
  taxId: '',
  email: '',
  phone: '',
};

export default function CounterpartyFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { toast } = useToast();

  const { data: existing, isLoading: loadingExisting } = useCounterparty(isEdit ? id : null);

  const createMutation = useCreateCounterparty();
  const updateMutation = useUpdateCounterparty();

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (isEdit && existing) {
      setForm({
        name: existing.name ?? '',
        displayName: existing.displayName ?? '',
        type: existing.type ?? 'CUSTOMER',
        status: existing.status ?? 'ACTIVE',
        taxId: existing.taxId ?? '',
        email: existing.email ?? '',
        phone: existing.phone ?? '',
      });
    }
  }, [isEdit, existing]);

  const handleChange = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: form });
        toast.success('Contraparte actualizada');
      } else {
        await createMutation.mutateAsync({
          ...form,
          organizationId,
          createdById: user?.id,
        });
        toast.success('Contraparte registrada');
      }
      navigate('/financial-operations/counterparties');
    } catch (err) {
      handleError(err);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const breadcrumbs = [
    { label: 'Tesorería' },
    { label: 'Contrapartes', to: '/financial-operations/counterparties' },
    { label: isEdit ? 'Editar' : 'Nueva contraparte' },
  ];

  if (isEdit && loadingExisting) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <FinOpsLoadingState message="Cargando datos..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          {isEdit ? 'Editar contraparte' : 'Nueva contraparte'}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Registra un cliente, proveedor o empleado
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-4 md:p-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <Input
              label="Nombre fiscal o Razón social"
              placeholder="Ej: Empresas SA de CV"
              value={form.name}
              onChange={handleChange('name')}
              required
            />
            <Input
              label="Nombre comercial"
              placeholder="Opcional"
              value={form.displayName}
              onChange={handleChange('displayName')}
            />
            <Select
              label="Tipo"
              options={TYPE_OPTIONS}
              value={form.type}
              onValueChange={handleChange('type')}
            />
            <Input
              label="RFC / ID Fiscal"
              placeholder="Opcional"
              value={form.taxId}
              onChange={handleChange('taxId')}
              className="font-mono uppercase"
            />
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="contacto@empresa.com"
              value={form.email}
              onChange={handleChange('email')}
            />
            <Input
              label="Teléfono"
              placeholder="Opcional"
              value={form.phone}
              onChange={handleChange('phone')}
            />
            {isEdit && (
              <Select
                label="Estado"
                options={STATUS_OPTIONS}
                value={form.status}
                onValueChange={handleChange('status')}
              />
            )}
          </div>

          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-border flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/financial-operations/counterparties')}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
