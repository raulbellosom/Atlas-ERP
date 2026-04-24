export default function DepartmentsPage() {
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
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="12.01" />
        </svg>
      </div>
      <div className="max-w-sm">
        <h1 className="text-xl font-semibold text-text-primary mb-2">Departamentos</h1>
        <p className="text-sm text-text-secondary">
          La gestión de departamentos estará disponible próximamente. Aquí podrás organizar la
          estructura organizacional y asignar empleados a cada área.
        </p>
      </div>
    </div>
  );
}
