import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge', () => {
  it('renderiza el texto del children', () => {
    render(<Badge>Activo</Badge>);
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('aplica variante neutral por defecto', () => {
    render(<Badge>Neutral</Badge>);
    expect(screen.getByText('Neutral').className).toContain('text-neutral-700');
  });

  it('aplica variante success', () => {
    render(<Badge variant="success">Pagado</Badge>);
    expect(screen.getByText('Pagado').className).toContain('bg-success-subtle');
  });

  it('aplica variante error', () => {
    render(<Badge variant="error">Error</Badge>);
    expect(screen.getByText('Error').className).toContain('bg-error-subtle');
  });

  it('aplica variante warning', () => {
    render(<Badge variant="warning">Pendiente</Badge>);
    expect(screen.getByText('Pendiente').className).toContain('bg-warning-subtle');
  });

  it('muestra punto (dot) cuando dot=true', () => {
    render(<Badge dot>Con Punto</Badge>);
    const container = screen.getByText('Con Punto').closest('span');
    const dotSpan = container.querySelector('[aria-hidden="true"]');
    expect(dotSpan).toBeTruthy();
    expect(dotSpan.className).toContain('rounded-full');
  });

  it('no muestra punto cuando dot=false (default)', () => {
    render(<Badge>Sin Punto</Badge>);
    const container = screen.getByText('Sin Punto').closest('span');
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('aplica forma pill por defecto (rounded-full)', () => {
    render(<Badge>Pill</Badge>);
    expect(screen.getByText('Pill').className).toContain('rounded-full');
  });

  it('aplica forma rounded cuando pill=false', () => {
    render(<Badge pill={false}>Label</Badge>);
    expect(screen.getByText('Label').className).toContain('rounded-md');
  });
});
