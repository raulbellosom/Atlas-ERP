export default function AccountingHomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="oklch(60% 0.19 160)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M9 13h6M9 17h4" />
        </svg>
      </div>
      <div className="max-w-sm">
        <h1 className="text-xl font-semibold text-text-primary mb-2">Contabilidad</h1>
        <p className="text-sm text-text-secondary">
          El módulo de Contabilidad está activo. Usa el menú lateral para consultar plan de
          cuentas, asientos, períodos fiscales e informes contables.
        </p>
      </div>
    </div>
  );
}
