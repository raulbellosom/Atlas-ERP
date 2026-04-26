import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApiError } from '@/hooks/useApiError';
import { usePermissions } from '@/hooks/usePermissions';
import {
  useMovement,
  useMovementAttachments,
  useUploadMovementAttachment,
  useUpdateMovementAttachment,
  useDeleteMovementAttachment,
} from '@/modules/financial-operations/hooks/useMovements';
import AttachmentList from '@/components/ui/AttachmentList';
import { downloadMovementReceipt } from '@/modules/financial-operations/utils/pdf/MovementReceiptPdf';
import { FINOPS_PERMISSIONS } from '@/modules/financial-operations/routes';
import { formatDate } from '@/lib/i18n';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { FinOpsLoadingState } from '@/modules/financial-operations/components/StateIndicators';
import { Tabs, TabContent } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/Toast';
import Spinner from '@/components/ui/Spinner';

/**
 * MovementDetailPage — Detalle de movimiento financiero.
 *
 * Tabs:
 * 1. Información general
 * 2. Adjuntos / Comprobantes (T-1410)
 */

const typeLabels = { INCOME: 'Ingreso', EXPENSE: 'Egreso', ADJUSTMENT: 'Ajuste' };
const typeVariants = { INCOME: 'green', EXPENSE: 'red', ADJUSTMENT: 'blue' };
const statusLabels = {
  DRAFT: 'Borrador',
  POSTED: 'Contabilizado',
  CANCELED: 'Cancelado',
  REVERSED: 'Revertido',
};
const statusVariants = {
  DRAFT: 'warning',
  POSTED: 'primary',
  CANCELED: 'neutral',
  REVERSED: 'neutral',
};

function formatMoney(amount, currency = 'MXN') {
  const val = parseFloat(amount ?? '0');
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(val);
}

export default function MovementDetailPage() {
  const { id } = useParams();
  const { handleError } = useApiError();
  const { hasAny, isAdmin } = usePermissions();
  const { toast } = useToast();

  const canUpload = isAdmin || hasAny(FINOPS_PERMISSIONS.ATTACHMENT_WRITE);
  const canWrite = isAdmin || hasAny(FINOPS_PERMISSIONS.MOVEMENT_WRITE);

  const { data: movement, isLoading, error } = useMovement(id);
  const { data: attachments = [], isLoading: loadingAttachments } = useMovementAttachments(id);
  const uploadMutation = useUploadMovementAttachment();
  const updateMutation = useUpdateMovementAttachment();
  const deleteMutation = useDeleteMovementAttachment();

  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  // ── File upload (T-1410) ──
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadMutation.mutateAsync({
        movementId: id,
        file,
        meta: {
          note: file.name,
          organizationId: movement.organizationId,
        },
      });
      toast.success('Comprobante adjuntado');
    } catch (err) {
      handleError(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRenameAttachment = async (attachmentId, newName) => {
    try {
      await updateMutation.mutateAsync({
        movementId: id,
        attachmentId,
        meta: { note: newName },
      });
      toast.success('Comprobante renombrado');
    } catch (err) {
      handleError(err);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await deleteMutation.mutateAsync({
        movementId: id,
        attachmentId,
      });
      toast.success('Comprobante eliminado');
    } catch (err) {
      handleError(err);
    }
  };

  const breadcrumbs = [
    { label: 'Tesorería' },
    { label: 'Movimientos', to: '/financial-operations/movements' },
    { label: movement?.reference || 'Detalle' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <FinOpsLoadingState message="Cargando datos del movimiento..." />
      </div>
    );
  }

  if (!movement) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <Card>
          <div className="p-6 text-center">
            <p className="text-text-secondary">Movimiento no encontrado</p>
            <Button
              as={Link}
              to="/financial-operations/movements"
              variant="secondary"
              className="mt-4"
            >
              Volver
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isIncome = movement.movementType === 'INCOME';
  const formattedAmount = formatMoney(movement.amount, movement.currencyCode);

  const tabs = [
    { value: 'info', label: 'Información' },
    { value: 'attachments', label: `Adjuntos (${attachments.length})` },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-text-primary">
              {movement.description || 'Movimiento'}
            </h1>
            <Badge variant={typeVariants[movement.movementType]} size="xs">
              {typeLabels[movement.movementType]}
            </Badge>
            <Badge variant={statusVariants[movement.status]} size="xs">
              {statusLabels[movement.status]}
            </Badge>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            {movement.reference ? <span className="font-mono">{movement.reference}</span> : null}
            {movement.reference ? ' · ' : ''}
            {formatDate(movement.occurredAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canWrite && (
            <Button
              as={Link}
              to={`/financial-operations/movements/${id}/edit`}
              variant="secondary"
              size="sm"
            >
              Editar
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              downloadMovementReceipt(
                { movement, attachments },
                `comprobante-${movement.reference ?? movement.id}`,
              )
            }
          >
            Imprimir comprobante
          </Button>
        </div>
      </div>

      {/* Amount card */}
      <Card>
        <div className="p-4 md:p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider font-medium">
              Monto
            </p>
            <p
              className={[
                'text-3xl font-bold font-mono tabular-nums mt-1',
                isIncome ? 'text-success' : 'text-error',
              ].join(' ')}
            >
              {isIncome ? '+' : '−'}
              {formattedAmount}
            </p>
          </div>
          <Badge variant="blue" size="sm">
            {movement.currencyCode ?? 'MXN'}
          </Badge>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultValue="info">
        <TabContent value="info">
          <Card>
            <div className="p-4 md:p-6">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                    Tipo
                  </dt>
                  <dd className="mt-1">
                    <Badge variant={typeVariants[movement.movementType]} size="xs">
                      {typeLabels[movement.movementType]}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                    Estado
                  </dt>
                  <dd className="mt-1">
                    <Badge variant={statusVariants[movement.status]} size="xs">
                      {statusLabels[movement.status]}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                    Fecha
                  </dt>
                  <dd className="mt-1 text-sm text-text-primary">
                    {formatDate(movement.occurredAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                    Referencia
                  </dt>
                  <dd className="mt-1 text-sm text-text-primary font-mono">
                    {movement.reference || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                    Conciliado
                  </dt>
                  <dd className="mt-1">
                    {movement.isReconciled ? (
                      <Badge variant="green" size="xs">
                        Sí
                      </Badge>
                    ) : (
                      <Badge variant="gray" size="xs">
                        No
                      </Badge>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                    Registrado
                  </dt>
                  <dd className="mt-1 text-sm text-text-primary">
                    {formatDate(movement.createdAt)}
                  </dd>
                </div>
                {movement.description && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                      Descripción
                    </dt>
                    <dd className="mt-1 text-sm text-text-primary">{movement.description}</dd>
                  </div>
                )}
              </dl>
            </div>
          </Card>
        </TabContent>

        <TabContent value="attachments">
          <Card>
            <div className="p-4 md:p-6">
              {/* Upload button (T-1410) */}
              {canUpload && (
                <div className="mb-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    onChange={handleUpload}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? 'Subiendo...' : 'Adjuntar comprobante'}
                  </Button>
                </div>
              )}

              {/* Attachment list */}
              {loadingAttachments ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                <AttachmentList
                  attachments={attachments}
                  onRename={canUpload ? handleRenameAttachment : undefined}
                  onDelete={canUpload ? handleDeleteAttachment : undefined}
                  readOnly={!canUpload}
                />
              )}
            </div>
          </Card>
        </TabContent>
      </Tabs>
    </div>
  );
}
