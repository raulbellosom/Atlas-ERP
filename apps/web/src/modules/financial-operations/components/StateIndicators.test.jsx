import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  FinOpsLoadingState,
  FinOpsEmptyState,
  FinOpsErrorState,
} from './StateIndicators';

describe('FinOpsLoadingState', () => {
  it('muestra el mensaje por defecto "Cargando..."', () => {
    render(<FinOpsLoadingState />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('muestra un mensaje personalizado', () => {
    render(<FinOpsLoadingState message="Obteniendo cuentas..." />);
    expect(screen.getByText('Obteniendo cuentas...')).toBeInTheDocument();
  });

  it('muestra el spinner de carga', () => {
    render(<FinOpsLoadingState />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('FinOpsEmptyState', () => {
  it('muestra el título por defecto "Sin datos"', () => {
    render(<FinOpsEmptyState />);
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
  });

  it('muestra el título personalizado', () => {
    render(<FinOpsEmptyState title="No hay cuentas bancarias" />);
    expect(screen.getByText('No hay cuentas bancarias')).toBeInTheDocument();
  });

  it('muestra la descripción personalizada', () => {
    render(<FinOpsEmptyState description="Crea tu primera cuenta para comenzar." />);
    expect(screen.getByText('Crea tu primera cuenta para comenzar.')).toBeInTheDocument();
  });

  it('muestra botón de acción cuando actionLabel y onAction están definidos', () => {
    render(<FinOpsEmptyState actionLabel="Crear cuenta" onAction={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument();
  });

  it('no muestra botón de acción cuando falta onAction', () => {
    render(<FinOpsEmptyState actionLabel="Crear cuenta" />);
    expect(screen.queryByRole('button', { name: 'Crear cuenta' })).not.toBeInTheDocument();
  });

  it('llama onAction al hacer clic en el botón de acción', () => {
    const onAction = vi.fn();
    render(<FinOpsEmptyState actionLabel="Crear cuenta" onAction={onAction} />);
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});

describe('FinOpsErrorState', () => {
  it('muestra el título por defecto "Error al cargar"', () => {
    render(<FinOpsErrorState />);
    expect(screen.getByText('Error al cargar')).toBeInTheDocument();
  });

  it('muestra mensaje de error personalizado', () => {
    render(<FinOpsErrorState message="La base de datos no responde." />);
    expect(screen.getByText('La base de datos no responde.')).toBeInTheDocument();
  });

  it('muestra botón "Reintentar" cuando onRetry está definido', () => {
    render(<FinOpsErrorState onRetry={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('no muestra botón "Reintentar" cuando onRetry no está definido', () => {
    render(<FinOpsErrorState />);
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });

  it('llama onRetry al hacer clic en "Reintentar"', () => {
    const onRetry = vi.fn();
    render(<FinOpsErrorState onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
