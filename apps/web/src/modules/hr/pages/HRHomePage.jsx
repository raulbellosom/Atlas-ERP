export default function HRHomePage() {
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
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <div className="max-w-sm">
        <h1 className="text-xl font-semibold text-text-primary mb-2">Recursos Humanos</h1>
        <p className="text-sm text-text-secondary">
          El módulo de Recursos Humanos está instalado. Las funcionalidades de empleados,
          departamentos y ausencias estarán disponibles próximamente.
        </p>
      </div>
    </div>
  );
}
