import Spinner from "@/components/ui/Spinner";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

/**
 * FinOpsLoadingState — Spinner centrado para páginas del módulo.
 */
export function FinOpsLoadingState({ message = "Cargando..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  );
}

/**
 * FinOpsEmptyState — Estado vacío con icono, título y CTA opcional.
 */
export function FinOpsEmptyState({
  icon,
  title = "Sin datos",
  description = "No hay registros disponibles",
  actionLabel,
  onAction,
}) {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        {icon && <div className="mb-4 text-text-disabled">{icon}</div>}
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary mt-1 max-w-sm">{description}</p>
        {actionLabel && onAction && (
          <Button variant="primary" size="sm" className="mt-4" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}

/**
 * FinOpsErrorState — Estado de error con mensaje y botón de reintentar.
 */
export function FinOpsErrorState({
  title = "Error al cargar",
  message = "Ocurrió un error inesperado. Intenta de nuevo.",
  onRetry,
}) {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-error">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary mt-1 max-w-sm">{message}</p>
        {onRetry && (
          <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </div>
    </Card>
  );
}
