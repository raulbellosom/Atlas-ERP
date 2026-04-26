import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renderiza el texto del children', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('aplica variante primary por defecto', () => {
    render(<Button>Accion</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('text-white');
  });

  it('aplica variante danger correctamente', () => {
    render(<Button variant="danger">Eliminar</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-error');
  });

  it('aplica variante secondary correctamente', () => {
    render(<Button variant="secondary">Cancelar</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-surface');
  });

  it('esta deshabilitado cuando disabled=true', () => {
    render(<Button disabled>Bloqueado</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('esta deshabilitado cuando loading=true', () => {
    render(<Button loading>Cargando...</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('muestra spinner SVG cuando loading=true', () => {
    render(<Button loading>Procesando</Button>);
    expect(screen.getByRole('button').querySelector('svg')).toBeTruthy();
  });

  it('aplica w-full cuando fullWidth=true', () => {
    render(<Button fullWidth>Accion Ancha</Button>);
    expect(screen.getByRole('button').className).toContain('w-full');
  });

  it('llama onClick al hacer clic', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clic</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('no llama onClick cuando esta deshabilitado', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Deshabilitado
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('usa type=button por defecto', () => {
    render(<Button>Default</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('respeta type=submit cuando se define', () => {
    render(<Button type="submit">Enviar</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('renderiza componente polimorfico con as', () => {
    render(
      <Button as="a" href="/finops/cuentas">
        Ir a cuentas
      </Button>,
    );

    expect(screen.getByRole('link', { name: 'Ir a cuentas' })).toHaveAttribute(
      'href',
      '/finops/cuentas',
    );
  });
});
