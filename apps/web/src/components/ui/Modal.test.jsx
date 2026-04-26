import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal', () => {
  it('no renderiza contenido cuando open=false', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Test Modal">
        <p>Contenido del modal</p>
      </Modal>,
    );
    expect(screen.queryByText('Contenido del modal')).not.toBeInTheDocument();
  });

  it('renderiza el título y contenido cuando open=true', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Modal de Prueba">
        <p>Cuerpo del modal</p>
      </Modal>,
    );
    expect(screen.getByText('Modal de Prueba')).toBeInTheDocument();
    expect(screen.getByText('Cuerpo del modal')).toBeInTheDocument();
  });

  it('renderiza description cuando se proporciona', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Modal" description="Descripción del modal">
        <p>Contenido</p>
      </Modal>,
    );
    expect(screen.getByText('Descripción del modal')).toBeInTheDocument();
  });

  it('llama onClose al hacer clic en el botón de cierre', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Modal Cerrable">
        <p>Contenido</p>
      </Modal>,
    );
    const closeBtn = screen.getByLabelText('Cerrar');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renderiza el footer cuando se proporciona', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Modal con Footer" footer={<button>Confirmar</button>}>
        <p>Contenido</p>
      </Modal>,
    );
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
  });

  it('no emite warning de Description cuando no se proporciona description', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Modal open={true} onClose={vi.fn()} title="Modal sin descripcion">
        <p>Contenido</p>
      </Modal>,
    );

    const warningOutput = [...consoleWarnSpy.mock.calls, ...consoleErrorSpy.mock.calls]
      .flat()
      .join(' ');
    expect(warningOutput).not.toContain('Missing `Description`');

    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
