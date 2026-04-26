import { useEffect, useMemo, useState } from 'react';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import PageHeader from '@/components/ui/PageHeader';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import { useIncomeStatementReport } from '../hooks/useAccounting';

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

export default function IncomeStatementReportPage() {
  const user = useAuthStore((store) => store.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();

  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(currentMonth));

  const filters = useMemo(() => ({ year: Number(year), month: Number(month) }), [year, month]);
  const { data: report, isLoading, error } = useIncomeStatementReport(organizationId, filters);

  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  const incomeRows = report?.income ?? [];
  const expenseRows = report?.expenses ?? [];
  const totals = report?.totals ?? { income: 0, expenses: 0, netResult: 0 };

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
        title="Estado de resultados"
        description="Ingresos, gastos y resultado neto del período"
      />

      <div className="rounded-xl border border-border bg-surface p-4 flex flex-wrap gap-3">
        <Select label="Año" value={year} onValueChange={setYear} options={YEAR_OPTIONS} className="w-36" />
        <Select label="Mes" value={month} onValueChange={setMonth} options={MONTH_OPTIONS} className="w-48" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Ingresos</p>
          <p className="font-mono text-lg font-semibold text-success">{formatMoney(totals.income)}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Gastos</p>
          <p className="font-mono text-lg font-semibold text-error">{formatMoney(totals.expenses)}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Resultado neto</p>
          <p className={`font-mono text-lg font-semibold ${totals.netResult >= 0 ? 'text-success' : 'text-error'}`}>
            {formatMoney(totals.netResult)}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Ingresos</h2>
          <Table
            columns={columns}
            data={incomeRows}
            isLoading={isLoading}
            sortable
            emptyTitle="Sin ingresos en este período"
            emptyDescription="No hay cuentas de ingresos con movimiento."
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Gastos</h2>
          <Table
            columns={columns}
            data={expenseRows}
            isLoading={isLoading}
            sortable
            emptyTitle="Sin gastos en este período"
            emptyDescription="No hay cuentas de gastos con movimiento."
          />
        </section>
      </div>
    </div>
  );
}
