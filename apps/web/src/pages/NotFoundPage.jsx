import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-subtle">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-brand-300">404</h1>
        <p className="text-text-secondary">Página no encontrada</p>
        <Link
          to="/dashboard"
          className="inline-block text-sm text-brand-600 hover:text-brand-700 underline"
        >
          Volver al dashboard
        </Link>
      </div>
    </div>
  );
}
