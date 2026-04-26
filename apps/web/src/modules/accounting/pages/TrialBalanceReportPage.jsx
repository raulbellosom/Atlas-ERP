import { useEffect, useMemo, useState } from 'react';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import PageHeader from '@/components/ui/PageHeader';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { useTrialBalanceReport } from '../hooks/useAccounting';

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;

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

const TYPE_LABELS = {
  ASSET: 'Activo',
  LIABILITY: 'Pasivo',
  EQUITY: 'Capital',
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
};

const TYPE_VARIANTS = {
  ASSET: 'blue',
  LIABILITY: 'red',
  EQUITY: 'violet',
  INCOME: 'green',
  EXPENSE: 'yellow',
};

export default function TrialBalanceReportPage() {
  const user = useAuthStore((store) => store.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();

  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(currentMonth));

  const filters = useMemo(() => ({ year: Number(year), month: Number(month) }), [year, month]);
  const { data: report, isLoading, error } = useTrialBalanceReport(organizationId, filters);

  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  const rows = report?.rows ?? [];
  const totals = report?.totals ?? { debits: 0, credits: 0, difference: 0 };

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
      key: 'accountType',
      header: 'Tipo',
      render: (row) => (
        <Badge variant={TYPE_VARIANTS[row.accountType] ?? 'gray'} size="xs">
          {TYPE_LABELS[row.accountType] ?? row.accountType}
        </Badge>
      ),
    },
    {
      key: 'debits',
      header: 'Débitos',
      align: 'right',
      sortable: true,
      render: (row) => <span className="font-mono text-sm">{formatMoney(row.debits)}</span>,
    },
    {
      key: 'credits',
      header: 'Créditos',
      align: 'right',
      sortable: true,
      render: (row) => <span className="font-mono text-sm">{formatMoney(row.credits)}</span>,
    },
    {
      key: 'balance',
      header: 'Saldo',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className={`font-mono text-sm font-medium ${row.balance >= 0 ? 'text-success' : 'text-error'}`}>
          {formatMoney(row.balance)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Balance de comprobación"
        description="Detalle de débitos y créditos por cuenta contable"
      />

      <div className="rounded-xl border border-border bg-surface p-4 flex flex-wrap gap-3">
        <Select label="Año" value={year} onValueChange={setYear} options={YEAR_OPTIONS} className="w-36" />
        <Select label="Mes" value={month} onValueChange={setMonth} options={MONTH_OPTIONS} className="w-48" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Total Débitos</p>
          <p className="font-mono text-lg font-semibold">{formatMoney(totals.debits)}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Total Créditos</p>
          <p className="font-mono text-lg font-semibold">{formatMoney(totals.credits)}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Diferencia</p>
          <p className={`font-mono text-lg font-semibold ${totals.difference === 0 ? 'text-success' : 'text-error'}`}>
            {formatMoney(totals.difference)}
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        data={rows}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin movimientos para este período"
        emptyDescription="No hay líneas contables registradas para el año y mes seleccionados."
      />
    </div>
  );
}
