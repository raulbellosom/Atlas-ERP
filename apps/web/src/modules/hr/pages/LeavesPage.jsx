export default function LeavesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="oklch(60% 0.19 290)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <div className="max-w-sm">
        <h1 className="text-xl font-semibold text-text-primary mb-2">Ausencias</h1>
        <p className="text-sm text-text-secondary">
          La gestión de ausencias y solicitudes de tiempo libre estará disponible próximamente. Aquí
          podrás registrar vacaciones, permisos y bajas del personal.
        </p>
      </div>
    </div>
  );
}
