/**
 * Componente de estado vacío reutilizable.
 *
 * @param {object} props
 * @param {string} props.title - Título principal
 * @param {string} [props.description] - Descripción opcional
 * @param {React.ReactNode} [props.action] - Botón o acción opcional
 * @param {string} [props.icon] - Emoji o icono de texto (default: "📭")
 */
export default function EmptyState({ title, description, action, icon = "📭" }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3">
      <div className="text-3xl" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-xs">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
