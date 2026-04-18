/**
 * Bloque skeleton para indicar carga de contenido.
 * @param {{ className?: string }} props
 */
export function Skeleton({ className = "" }) {
  return (
    <div
      className={[
        "animate-pulse rounded bg-gray-200",
        className,
      ].join(" ")}
    />
  );
}

/**
 * Skeleton de fila de tabla (N columnas).
 */
export function TableRowSkeleton({ cols = 4, rows = 5 }) {
  return Array.from({ length: rows }).map((_, ri) => (
    <tr key={ri} className="border-b border-border">
      {Array.from({ length: cols }).map((_, ci) => (
        <td key={ci} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  ));
}

/**
 * Skeleton de card de perfil.
 */
export function CardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
