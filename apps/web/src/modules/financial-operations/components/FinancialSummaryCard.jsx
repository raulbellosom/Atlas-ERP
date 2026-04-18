import { Card } from "@/components/ui/Card";

/**
 * FinancialSummaryCard — Card reutilizable para métricas financieras.
 *
 * Props:
 *   title    — label superior (ej: "Total CxC")
 *   amount   — monto numérico como string
 *   currency — código ISO (default MXN)
 *   subtitle — texto inferior opcional
 *   variant  — "income" | "expense" | "neutral" (controla color del monto)
 */
export default function FinancialSummaryCard({
  title,
  amount,
  currency = "MXN",
  subtitle,
  variant = "neutral",
}) {
  const val = parseFloat(amount ?? "0");
  const formatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(val);

  const colorClass =
    variant === "income"
      ? "text-success"
      : variant === "expense"
        ? "text-error"
        : val >= 0
          ? "text-text-primary"
          : "text-error";

  return (
    <Card>
      <div className="p-4">
        <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">
          {title}
        </p>
        <p className={`text-2xl font-bold font-mono tabular-nums mt-2 ${colorClass}`}>
          {formatted}
        </p>
        {subtitle && (
          <p className="text-xs text-text-disabled mt-1">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}
