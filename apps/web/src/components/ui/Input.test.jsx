import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input';

describe('Input', () => {
  it('renderiza el label cuando se proporciona', () => {
    render(<Input label="Correo electrónico" />);
    expect(screen.getByText('Correo electrónico')).toBeInTheDocument();
  });

  it('asocia el label con el input vía htmlFor/id', () => {
    render(<Input label="Nombre" id="nombre" />);
    const label = screen.getByText('Nombre');
    const input = screen.getByRole('textbox');
    expect(label).toHaveAttribute('for', input.id);
  });

  it('muestra texto de error cuando error está definido', () => {
    render(<Input label="Monto" error="El monto es requerido" />);
    expect(screen.getByRole('alert')).toHaveTextContent('El monto es requerido');
  });

  it('aplica aria-invalid cuando hay error', () => {
    render(<Input label="Campo" error="Campo inválido" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('muestra helpText cuando no hay error', () => {
    render(<Input label="RFC" helpText="Ejemplo: XAXX010101000" />);
    expect(screen.getByText('Ejemplo: XAXX010101000')).toBeInTheDocument();
  });

  it('no muestra helpText cuando hay error', () => {
    render(<Input label="RFC" helpText="Ayuda" error="Error en RFC" />);
    expect(screen.queryByText('Ayuda')).not.toBeInTheDocument();
  });

  it('muestra asterisco cuando required=true', () => {
    render(<Input label="Campo obligatorio" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('llama onChange al escribir', () => {
    const handleChange = vi.fn();
    render(<Input label="Búsqueda" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abc' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('acepta el placeholder correctamente', () => {
    render(<Input placeholder="Escribe aquí" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Escribe aquí');
  });
});
