import { useParams, Link } from "react-router-dom";
import { useApiError } from "@/hooks/useApiError";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useReconciliationSession,
  useReconciliationItems,
  useReconcileSession,
  useCloseSession,
  useApproveSession,
} from "@/modules/financial-operations/hooks/useReconciliation";
import { FINOPS_PERMISSIONS } from "@/modules/financial-operations/routes";
import { formatDate } from "@/lib/i18n";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import AlertDialog from "@/components/ui/AlertDialog";
import { useState } from "react";

/**
 * ReconciliationFlowPage — Flujo visual de conciliación.
 *
 * Muestra los items de una sesión y permite:
 * - Marcar items como conciliados
 * - Cerrar la sesión
 * - Aprobar la sesión
 */

const statusVariants = { OPEN: "yellow", CLOSED: "blue", APPROVED: "green" };
const statusLabels = { OPEN: "Abierta", CLOSED: "Cerrada", APPROVED: "Aprobada" };

function formatMoney(amount, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(parseFloat(amount ?? "0"));
}

export default function ReconciliationFlowPage() {
  const { id } = useParams();
  const { handleError } = useApiError();
  const { hasAny, isAdmin } = usePermissions();
  const { toast } = useToast();

  const canWrite = isAdmin || hasAny(FINOPS_PERMISSIONS.RECONCILIATION_WRITE);

  const { data: session, isLoading } = useReconciliationSession(id);
  const { data: items = [], isLoading: loadingItems } = useReconciliationItems(id);

  const reconcileMutation = useReconcileSession();
  const closeMutation = useCloseSession();
  const approveMutation = useApproveSession();

  const [confirmAction, setConfirmAction] = useState(null);

  const handleReconcile = async () => {
    try {
      const matchedItemIds = items
        .filter((i) => !i.isReconciled)
        .map((i) => i.id);
      await reconcileMutation.mutateAsync({
        sessionId: id,
        data: { itemIds: matchedItemIds },
      });
      toast.success("Items conciliados exitosamente");
    } catch (err) {
      handleError(err);
    }
  };

  const handleClose = async () => {
    try {
      await closeMutation.mutateAsync({ sessionId: id, data: {} });
      toast.success("Sesión cerrada");
    } catch (err) {
      handleError(err);
    } finally {
      setConfirmAction(null);
    }
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({ sessionId: id, data: {} });
      toast.success("Sesión aprobada");
    } catch (err) {
      handleError(err);
    } finally {
      setConfirmAction(null);
    }
  };

  const breadcrumbs = [
    { label: "Tesorería" },
    { label: "Conciliación", to: "/financial-operations/reconciliation" },
    { label: session?.id?.slice(0, 8) ?? "Sesión" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex justify-center py-20"><Spinner /></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <Card><div className="p-6 text-center">
          <p className="text-text-secondary">Sesión no encontrada</p>
          <Button as={Link} to="/financial-operations/reconciliation" variant="secondary" className="mt-4">Volver</Button>
        </div></Card>
      </div>
    );
  }

  const isOpen = session.status === "OPEN";
  const reconciledItems = items.filter((i) => i.isReconciled);
  const pendingItems = items.filter((i) => !i.isReconciled);
  const progress = items.length > 0 ? Math.round((reconciledItems.length / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-text-primary">
              Conciliación
            </h1>
            <Badge variant={statusVariants[session.status] ?? "gray"} size="sm">
              {statusLabels[session.status] ?? session.status}
            </Badge>
          </div>
          <p className="text-sm text-text-secondary mt-1 font-mono">
            {session.id}
          </p>
        </div>
        {canWrite && isOpen && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setConfirmAction("close")}>
              Cerrar sesión
            </Button>
            <Button variant="primary" size="sm" onClick={() => setConfirmAction("approve")}>
              Aprobar
            </Button>
          </div>
        )}
      </div>

      {/* Progress */}
      <Card>
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-text-primary">Progreso de conciliación</p>
            <span className="text-sm font-mono text-text-secondary">
              {reconciledItems.length}/{items.length} ({progress}%)
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-ink-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Pending items */}
      {loadingItems ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <>
          {pendingItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">
                  Pendientes ({pendingItems.length})
                </h2>
                {canWrite && isOpen && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleReconcile}
                    disabled={reconcileMutation.isPending}
                  >
                    {reconcileMutation.isPending ? "Conciliando..." : "Conciliar todos"}
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {pendingItems.map((item) => (
                  <Card key={item.id}>
                    <div className="p-3 md:p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-text-primary font-medium truncate">
                          {item.description || item.reference || "Sin descripción"}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {formatDate(item.occurredAt ?? item.createdAt)}
                          {item.reference && <> · <span className="font-mono">{item.reference}</span></>}
                        </p>
                      </div>
                      <span className="font-mono text-sm tabular-nums font-medium text-text-primary whitespace-nowrap">
                        {formatMoney(item.amount, item.currencyCode)}
                      </span>
                      <Badge variant="yellow" size="xs">Pendiente</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {reconciledItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text-primary">
                Conciliados ({reconciledItems.length})
              </h2>
              <div className="space-y-2 opacity-70">
                {reconciledItems.map((item) => (
                  <Card key={item.id}>
                    <div className="p-3 md:p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-text-primary font-medium truncate">
                          {item.description || item.reference || "Sin descripción"}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {formatDate(item.occurredAt ?? item.createdAt)}
                        </p>
                      </div>
                      <span className="font-mono text-sm tabular-nums font-medium text-success whitespace-nowrap">
                        {formatMoney(item.amount, item.currencyCode)}
                      </span>
                      <Badge variant="green" size="xs">Conciliado</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {items.length === 0 && (
            <Card>
              <div className="p-6 text-center">
                <p className="text-text-secondary">Sin items en esta sesión</p>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Confirm dialogs */}
      <AlertDialog
        open={confirmAction === "close"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Cerrar sesión de conciliación"
        description="¿Cerrar esta sesión? Los items pendientes quedarán sin conciliar."
        cancelLabel="Cancelar"
        confirmLabel="Cerrar sesión"
        onConfirm={handleClose}
      />
      <AlertDialog
        open={confirmAction === "approve"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Aprobar sesión de conciliación"
        description="¿Aprobar esta sesión? No se podrán hacer más cambios después."
        cancelLabel="Cancelar"
        confirmLabel="Aprobar"
        onConfirm={handleApprove}
      />
    </div>
  );
}
