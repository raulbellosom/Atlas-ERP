import { Component } from "react";

/**
 * Error Boundary de React para capturar errores de renderizado.
 * Muestra un fallback UI en lugar de una pantalla en blanco.
 *
 * Uso:
 *   <ErrorBoundary>
 *     <ComponenteQuePodriaFallar />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<div>Algo salió mal</div>}>
 *     ...
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === "function"
          ? this.props.fallback({ error: this.state.error, reset: this.reset })
          : this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div className="text-4xl text-text-disabled">⚠</div>
          <h2 className="text-base font-semibold text-text-primary">
            Algo salió mal
          </h2>
          <p className="text-sm text-text-secondary max-w-sm">
            {this.state.error?.message ?? "Error inesperado en la aplicación."}
          </p>
          <button
            onClick={this.reset}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
