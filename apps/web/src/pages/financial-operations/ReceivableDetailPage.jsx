import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import {
  useReceivable,
  useRegisterReceivablePayment,
} from '@/modules/financial-operations/hooks/useCxcCxp';
import { useBankAccounts } from '@/modules/financial-operations/hooks/useBankAccounts';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import {
  FinOpsLoadingState,
  EmptyState,
} from '@/modules/financial-operations/components/StateIndicators';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export default function ReceivableDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { toast } = useToast();

  const { data: receivable, isLoading, error } = useReceivable(id);
  const { data: bankAccounts = [] } = useBankAccounts(organizationId);
  const registerPaymentMutation = useRegisterReceivablePayment();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    bankAccountId: '',
    occurredAt: new Date().toISOString().slice(0, 10),
  });

  if (isLoading) return <FinOpsLoadingState message="Cargando detalle..." />;
  if (error || !receivable)
    return <EmptyState title="Error" description="No se pudo cargar la CxC" />;

  const isPaid = receivable.status === 'PAID' || receivable.status === 'CANCELED';
  const pendingAmount = Number(receivable.amount) - Number(receivable.amountPaid);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerPaymentMutation.mutateAsync({
        id,
        data: {
          ...paymentForm,
          occurredAt: new Date(paymentForm.occurredAt).toISOString(),
        },
      });
      toast.success('Pago registrado exitosamente');
      setIsPaymentModalOpen(false);
      setPaymentForm({
        amount: '',
        bankAccountId: '',
        occurredAt: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      handleError(err);
    }
  };

  const breadcrumbs = [
    { label: 'Tesorería' },
    { label: 'Cuentas por cobrar', to: '/financial-operations/receivables' },
    { label: 'Detalle' },
  ];

  const accountOptions = bankAccounts
    .filter((a) => a.isActive)
    .map((a) => ({ value: a.id, label: `${a.name} — ${a.bankName}` }));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            CxC: {receivable.reference || receivable.id}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Monto total: {Number(receivable.amount).toLocaleString()} {receivable.currencyCode}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/financial-operations/receivables/${id}/edit`)}
          >
            Editar
          </Button>
          {!isPaid && (
            <Button
              variant="primary"
              onClick={() => {
                setPaymentForm((prev) => ({ ...prev, amount: pendingAmount.toString() }));
                setIsPaymentModalOpen(true);
              }}
            >
              Registrar pago
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6">
          <h2 className="text-lg font-medium mb-4">Información general</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <dt className="text-sm font-medium text-text-secondary">Estado</dt>
              <dd className="mt-1 text-sm text-text-primary">{receivable.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-text-secondary">Monto pagado</dt>
              <dd className="mt-1 text-sm text-text-primary">
                {Number(receivable.amountPaid).toLocaleString()} {receivable.currencyCode}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-text-secondary">Fecha de emisión</dt>
              <dd className="mt-1 text-sm text-text-primary">
                {new Date(receivable.issuedAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-text-secondary">Fecha de vencimiento</dt>
              <dd className="mt-1 text-sm text-text-primary">
                {receivable.dueAt ? new Date(receivable.dueAt).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-text-secondary">Descripción</dt>
              <dd className="mt-1 text-sm text-text-primary">
                {receivable.description || 'Sin descripción'}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Registrar Pago"
      >
        <form onSubmit={handlePaymentSubmit} className="p-4 space-y-4">
          <Input
            label="Monto a pagar"
            type="number"
            step="0.01"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
            required
            max={pendingAmount}
            helpText={`Pendiente: ${pendingAmount.toLocaleString()} ${receivable.currencyCode}`}
          />
          <Select
            label="Cuenta bancaria destino"
            options={accountOptions}
            value={paymentForm.bankAccountId}
            onValueChange={(val) => setPaymentForm({ ...paymentForm, bankAccountId: val })}
            required
          />
          <Input
            label="Fecha del pago"
            type="date"
            value={paymentForm.occurredAt}
            onChange={(e) => setPaymentForm({ ...paymentForm, occurredAt: e.target.value })}
            required
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={registerPaymentMutation.isPending}>
              {registerPaymentMutation.isPending ? 'Registrando...' : 'Guardar pago'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
