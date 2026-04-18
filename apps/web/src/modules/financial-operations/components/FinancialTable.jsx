import Table from "@/components/ui/Table";

/**
 * FinancialTable — Wrapper de Table con formato financiero.
 *
 * Agrega:
 * - Clase font-mono a columnas de montos
 * - Coloreo automático income/expense en la columna "amount"
 * - Props passthrough a Table
 */

function formatMoney(amount, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(parseFloat(amount ?? "0"));
}

/**
 * Genera un render de monto coloreado.
 * @param {object} opts
 * @param {string} opts.amountKey — key del monto en la fila (default "amount")
 * @param {string} opts.currencyKey — key de la moneda (default "currencyCode")
 * @param {"auto"|"income"|"expense"} opts.colorMode — modo de coloreo
 */
export function moneyRender({
  amountKey = "amount",
  currencyKey = "currencyCode",
  colorMode = "auto",
} = {}) {
  return (row) => {
    const val = parseFloat(row[amountKey] ?? "0");
    let colorClass;
    if (colorMode === "income") colorClass = "text-success";
    else if (colorMode === "expense") colorClass = "text-error";
    else colorClass = val >= 0 ? "text-success" : "text-error";

    return (
      <span className={`font-mono text-sm tabular-nums font-medium ${colorClass}`}>
        {formatMoney(row[amountKey], row[currencyKey])}
      </span>
    );
  };
}

/**
 * FinancialTable — Tabla financiera con estilos Meridian.
 * Pasa todas las props a Table.
 */
export default function FinancialTable(props) {
  return <Table {...props} />;
}
