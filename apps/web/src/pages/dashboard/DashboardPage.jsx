import PageHeader from "@/components/ui/PageHeader";

/**
 * Dashboard shell — página principal de la app autenticada.
 * Se poblará con widgets de módulos en bloques posteriores.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Panorama general de la operación"
      />

      {/* Placeholder de widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["Módulo 1", "Módulo 2", "Módulo 3"].map((label) => (
          <div
            key={label}
            className="bg-surface border border-border rounded-lg p-6 text-sm text-text-disabled"
          >
            {label} — pendiente
          </div>
        ))}
      </div>
    </div>
  );
}
