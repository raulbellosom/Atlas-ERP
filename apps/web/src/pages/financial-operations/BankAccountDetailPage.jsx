import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { useApiError } from "@/hooks/useApiError";
import {
  useBankAccount,
  useBankAccountBalance,
} from "@/modules/financial-operations/hooks/useBankAccounts";
import { FINOPS_PERMISSIONS } from "@/modules/financial-operations/routes";
import { formatDate } from "@/lib/i18n";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { FinOpsLoadingState } from "@/modules/financial-operations/components/StateIndicators";
import { Tabs, TabContent } from "@/components/ui/Tabs";

/**
 * BankAccountDetailPage — Vista detalle de una cuenta bancaria.
 *
 * Tabs:
 * 1. Información general — datos de la cuenta
 * 2. Saldo — balance actual y última actualización
 *
 * Usa los componentes Radix (Tabs, Badge) y layout responsive.
 */
export default function BankAccountDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const { hasAny, isAdmin } = usePermissions();

  const canWrite = isAdmin || hasAny(FINOPS_PERMISSIONS.BANK_ACCOUNT_WRITE);

  const { data: account, isLoading, error } = useBankAccount(id);
  const { data: balanceData } = useBankAccountBalance(id);

  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  const breadcrumbs = [
    { label: "Tesorería" },
    { label: "Cuentas", to: "/financial-operations/bank-accounts" },
    { label: account?.name ?? "Detalle" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <FinOpsLoadingState message="Cargando cuenta bancaria..." />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <Card>
          <div className="p-6 text-center">
            <p className="text-text-secondary">Cuenta no encontrada</p>
            <Button
              as={Link}
              to="/financial-operations/bank-accounts"
              variant="secondary"
              className="mt-4"
            >
              Volver al listado
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const balance = parseFloat(account.currentBalance ?? balanceData?.currentBalance ?? "0");
  const currency = account.currencyCode ?? "MXN";
  const formattedBalance = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(balance);

  const tabs = [
    { value: "info", label: "Información" },
    { value: "balance", label: "Saldo" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-text-primary">
              {account.name}
            </h1>
            {account.isActive ? (
              <Badge variant="green" size="xs">Activa</Badge>
            ) : (
              <Badge variant="gray" size="xs">Inactiva</Badge>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-1">
            {account.bankName} · <span className="font-mono">{account.accountNumberMask}</span>
          </p>
        </div>

        {canWrite && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/financial-operations/bank-accounts/${id}/edit`)}
          >
            Editar cuenta
          </Button>
        )}
      </div>

      {/* Balance card */}
      <Card>
        <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider font-medium">
              Saldo actual
            </p>
            <p className={[
              "text-3xl font-bold font-mono tabular-nums mt-1",
              balance >= 0 ? "text-success" : "text-error",
            ].join(" ")}>
              {formattedBalance}
            </p>
          </div>
          <Badge variant="blue" size="sm">{currency}</Badge>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultValue="info">
        <TabContent value="info">
          <Card>
            <div className="p-4 md:p-6">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-secondary font-medium uppercase tracking-wider">Nombre</dt>
                  <dd className="mt-1 text-sm text-text-primary">{account.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary font-medium uppercase tracking-wider">Banco</dt>
                  <dd className="mt-1 text-sm text-text-primary">{account.bankName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary font-medium uppercase tracking-wider">Titular</dt>
                  <dd className="mt-1 text-sm text-text-primary">{account.accountHolder ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary font-medium uppercase tracking-wider">Número de cuenta</dt>
                  <dd className="mt-1 text-sm text-text-primary font-mono">{account.accountNumberMask}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary font-medium uppercase tracking-wider">Moneda</dt>
                  <dd className="mt-1 text-sm text-text-primary">{currency}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary font-medium uppercase tracking-wider">Estado</dt>
                  <dd className="mt-1">
                    {account.isActive
                      ? <Badge variant="green" size="xs">Activa</Badge>
                      : <Badge variant="gray" size="xs">Inactiva</Badge>}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary font-medium uppercase tracking-wider">Registrada</dt>
                  <dd className="mt-1 text-sm text-text-primary">{formatDate(account.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary font-medium uppercase tracking-wider">Última actualización</dt>
                  <dd className="mt-1 text-sm text-text-primary">{formatDate(account.updatedAt)}</dd>
                </div>
              </dl>
            </div>
          </Card>
        </TabContent>

        <TabContent value="balance">
          <Card>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-surface-subtle border border-border">
                  <p className="text-xs text-text-secondary font-medium">Saldo actual</p>
                  <p className={[
                    "text-xl font-bold font-mono tabular-nums mt-1",
                    balance >= 0 ? "text-success" : "text-error",
                  ].join(" ")}>
                    {formattedBalance}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-surface-subtle border border-border">
                  <p className="text-xs text-text-secondary font-medium">Moneda</p>
                  <p className="text-xl font-bold text-text-primary mt-1">{currency}</p>
                </div>
                <div className="p-4 rounded-lg bg-surface-subtle border border-border">
                  <p className="text-xs text-text-secondary font-medium">Última actualización</p>
                  <p className="text-sm text-text-primary mt-2">
                    {formatDate(balanceData?.updatedAt ?? account.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  as={Link}
                  to={`/financial-operations/movements?bankAccountId=${id}`}
                  variant="secondary"
                  size="sm"
                >
                  Ver movimientos de esta cuenta
                </Button>
              </div>
            </div>
          </Card>
        </TabContent>
      </Tabs>
    </div>
  );
}
