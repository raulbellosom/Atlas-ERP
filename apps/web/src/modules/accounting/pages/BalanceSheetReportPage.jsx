import { useEffect, useMemo, useState } from 'react';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import PageHeader from '@/components/ui/PageHeader';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import { useBalanceSheetReport } from '../hooks/useAccounting';

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

const MONTH_NAMES = [
  '',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, idx) => ({
  value: String(currentYear - idx),
  label: String(currentYear - idx),
}));

const MONTH_OPTIONS = MONTH_NAMES.slice(1).map((label, idx) => ({
  value: String(idx + 1),
  label,
}));

function formatMoney(value) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

export default function BalanceSheetReportPage() {
  const user = useAuthStore((store) => store.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();

  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(currentMonth));

  const filters = useMemo(() => ({ year: Number(year), month: Number(month) }), [year, month]);
  const { data: report, isLoading, error } = useBalanceSheetReport(organizationId, filters);

  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  const assets = report?.assets ?? [];
  const liabilities = report?.liabilities ?? [];
  const equity = report?.equity ?? [];
  const totals = report?.totals ?? {
    assets: 0,
    liabilities: 0,
    equity: 0,
    liabilitiesPlusEquity: 0,
    difference: 0,
  };

  const columns = [
    {
      key: 'code',
      header: 'Código',
      sortable: true,
      render: (row) => <span className="font-mono text-sm">{row.code}</span>,
    },
    {
      key: 'name',
      header: 'Cuenta',
      sortable: true,
      render: (row) => <span className="text-sm text-text-primary">{row.name}</span>,
    },
    {
      key: 'amount',
      header: 'Monto',
      align: 'right',
      sortable: true,
      render: (row) => <span className="font-mono text-sm">{formatMoney(row.amount)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Balance general"
        description="Situación financiera a una fecha de corte"
      />

      <div className="rounded-xl border border-border bg-surface p-4 flex flex-wrap gap-3">
        <Select label="Año" value={year} onValueChange={setYear} options={YEAR_OPTIONS} className="w-36" />
        <Select label="Mes" value={month} onValueChange={setMonth} options={MONTH_OPTIONS} className="w-48" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Activos</p>
          <p className="font-mono text-lg font-semibold">{formatMoney(totals.assets)}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Pasivos</p>
          <p className="font-mono text-lg font-semibold">{formatMoney(totals.liabilities)}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Capital</p>
          <p className="font-mono text-lg font-semibold">{formatMoney(totals.equity)}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Pasivo + Capital</p>
          <p className="font-mono text-lg font-semibold">{formatMoney(totals.liabilitiesPlusEquity)}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Diferencia</p>
          <p className={`font-mono text-lg font-semibold ${totals.difference === 0 ? 'text-success' : 'text-error'}`}>
            {formatMoney(totals.difference)}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Activos</h2>
          <Table
            columns={columns}
            data={assets}
            isLoading={isLoading}
            sortable
            emptyTitle="Sin cuentas de activo con saldo"
            emptyDescription="No hay cuentas de activo con movimientos acumulados."
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Pasivos</h2>
          <Table
            columns={columns}
            data={liabilities}
            isLoading={isLoading}
            sortable
            emptyTitle="Sin cuentas de pasivo con saldo"
            emptyDescription="No hay cuentas de pasivo con movimientos acumulados."
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Capital</h2>
          <Table
            columns={columns}
            data={equity}
            isLoading={isLoading}
            sortable
            emptyTitle="Sin cuentas de capital con saldo"
            emptyDescription="No hay cuentas de capital con movimientos acumulados."
          />
        </section>
      </div>
    </div>
  );
}
