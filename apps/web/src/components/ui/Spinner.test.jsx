import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner, { FullPageSpinner } from './Spinner';

describe('Spinner', () => {
  it('renderiza con role="status"', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('tiene aria-label="Cargando"', () => {
    render(<Spinner />);
    expect(screen.getByLabelText('Cargando')).toBeInTheDocument();
  });

  it('aplica tamaño sm correctamente', () => {
    render(<Spinner size="sm" />);
    expect(screen.getByRole('status').className).toContain('w-4');
  });

  it('aplica tamaño lg correctamente', () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole('status').className).toContain('w-8');
  });

  it('tiene clase animate-spin', () => {
    render(<Spinner />);
    expect(screen.getByRole('status').className).toContain('animate-spin');
  });
});

describe('FullPageSpinner', () => {
  it('renderiza el spinner dentro de un contenedor de pantalla completa', () => {
    render(<FullPageSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    const container = screen.getByRole('status').closest('div[class*="min-h-screen"]');
    expect(container).toBeTruthy();
  });
});
