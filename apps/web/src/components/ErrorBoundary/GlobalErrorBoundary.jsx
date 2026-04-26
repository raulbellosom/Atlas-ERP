import { Component } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function reportError(payload) {
  if (import.meta.env.DEV) return;
  try {
    await fetch(`${API_URL}/telemetry/client-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // silent — no queremos que el reporte de error genere otro error
  }
}

export class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    const payload = {
      error: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      route: window.location.pathname,
      timestamp: new Date().toISOString(),
    };

    if (import.meta.env.DEV) {
      console.error('[GlobalErrorBoundary]', payload);
    }

    void reportError(payload);
  }

  handleReload() {
    window.location.reload();
  }

  handleHome() {
    window.location.href = '/';
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-subtle p-6">
        <div
          className="bg-surface border border-border rounded-2xl p-10 max-w-md w-full text-center"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          {/* Warning icon — inline SVG, no emoji */}
          <div className="flex justify-center mb-6">
            <svg
              width="48"
              height="48"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-error"
              aria-hidden="true"
            >
              <path d="M26 8L5 44h42L26 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M26 23v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="26" cy="38" r="1.75" fill="currentColor" />
            </svg>
          </div>

          <h1 className="font-display font-bold text-xl text-text-primary mb-3">
            Algo salió mal
          </h1>
          <p className="font-sans text-sm text-text-secondary leading-relaxed mb-8">
            Ocurrió un error inesperado. Por favor recarga la página.
            Si el problema persiste, contacta al soporte técnico.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center h-11 px-5 text-sm font-display font-semibold text-white rounded-lg transition-all duration-150 active:scale-[0.97] cursor-pointer"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Recargar página
            </button>
            <button
              onClick={this.handleHome}
              className="inline-flex items-center justify-center h-11 px-5 text-sm font-display font-semibold text-text-primary rounded-lg bg-surface border border-border transition-all duration-150 hover:bg-surface-subtle hover:border-border-strong active:bg-surface-sunken cursor-pointer"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }
}
