import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FinancialSummaryCard from './FinancialSummaryCard';

describe('FinancialSummaryCard', () => {
  it('renderiza el título', () => {
    render(<FinancialSummaryCard title="Total CxC" amount="15000" />);
    expect(screen.getByText('Total CxC')).toBeInTheDocument();
  });

  it('formatea el monto como moneda MXN por defecto', () => {
    render(<FinancialSummaryCard title="Saldo" amount="5000" />);
    expect(screen.getByText(/\$5,000\.00/)).toBeInTheDocument();
  });

  it('formatea el monto con la moneda especificada', () => {
    render(<FinancialSummaryCard title="Balance USD" amount="1000" currency="USD" />);
    expect(screen.getByText(/1,000\.00/)).toBeInTheDocument();
  });

  it('muestra el subtitle cuando se proporciona', () => {
    render(<FinancialSummaryCard title="Total" amount="0" subtitle="Al 30 de abril" />);
    expect(screen.getByText('Al 30 de abril')).toBeInTheDocument();
  });

  it('no muestra subtitle cuando no se proporciona', () => {
    render(<FinancialSummaryCard title="Total" amount="0" />);
    expect(screen.queryByText('Al 30 de abril')).not.toBeInTheDocument();
  });

  it('aplica clase text-success en variante income', () => {
    render(<FinancialSummaryCard title="Ingresos" amount="3000" variant="income" />);
    const amountEl = screen.getByText(/3,000\.00/);
    expect(amountEl.className).toContain('text-success');
  });

  it('aplica clase text-error en variante expense', () => {
    render(<FinancialSummaryCard title="Egresos" amount="1500" variant="expense" />);
    const amountEl = screen.getByText(/1,500\.00/);
    expect(amountEl.className).toContain('text-error');
  });

  it('trata amount undefined como $0.00', () => {
    render(<FinancialSummaryCard title="Vacío" amount={undefined} />);
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
  });
});
