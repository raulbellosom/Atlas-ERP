/**
 * exportCsv.js — Utilidad genérica de exportación a CSV para reportes FinOps.
 *
 * BOM UTF-8 (\uFEFF) incluido para compatibilidad con Excel en Windows.
 * Separador: coma. Valores con comas/comillas envueltos en comillas dobles.
 * Punto decimal como separador de decimales (estándar CSV internacional).
 *
 * Task origen: T-1607 (Fase 16 Bloque 2)
 * Decisión: utilidad genérica desde el primer reporte para evitar duplicación.
 */

/**
 * Escapa un valor para CSV: envuelve en comillas si contiene coma, comilla o salto de línea.
 * @param {unknown} val
 * @returns {string}
 */
function escapeCsv(val) {
  const s = String(val ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

/**
 * Dispara la descarga de un Blob como archivo.
 * @param {Blob} blob
 * @param {string} filename — nombre de archivo con extensión
 */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exporta un array de objetos a un archivo CSV descargable.
 *
 * @param {object[]} rows — Filas de datos.
 * @param {Array<{
 *   key: string | ((row: object) => unknown),
 *   header: string,
 *   format?: (value: unknown, row: object) => string
 * }>} columns — Especificación de columnas.
 * @param {string} filename — Nombre del archivo (sin extensión ".csv").
 */
export function exportToCsv(rows, columns, filename) {
  const header = columns.map((c) => escapeCsv(c.header)).join(",");

  const dataLines = rows.map((row) =>
    columns
      .map((col) => {
        const raw = typeof col.key === "function" ? col.key(row) : row[col.key];
        const formatted = col.format ? col.format(raw, row) : raw;
        return escapeCsv(formatted ?? "");
      })
      .join(","),
  );

  const content = "\uFEFF" + [header, ...dataLines].join("\r\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filename}.csv`);
}

// ─── Helpers de formato de columnas ──────────────────────────────────────────

/** Formatea una fecha ISO a DD/MM/YYYY (latinoamericano). */
export function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/** Formatea un número como decimal con 2 lugares (sin símbolo de moneda). */
export function fmtDecimal(val) {
  return parseFloat(val ?? "0").toFixed(2);
}

// ─── Definiciones de columnas por reporte ────────────────────────────────────

/**
 * Columnas CSV para el reporte de movimientos.
 * @param {Object} bankAccountsById — mapa id → cuenta
 * @param {Object} typeLabels
 * @param {Object} statusLabels
 */
export function movementsColumns(bankAccountsById, typeLabels, statusLabels) {
  return [
    { key: "occurredAt",   header: "Fecha",       format: (v) => fmtDate(v) },
    { key: (r) => bankAccountsById[r.bankAccountId]?.name ?? "", header: "Cuenta" },
    { key: "movementType", header: "Tipo",        format: (v) => typeLabels[v] ?? v ?? "" },
    { key: "description",  header: "Descripción" },
    { key: "amount",       header: "Monto",       format: fmtDecimal },
    { key: "currencyCode", header: "Moneda" },
    { key: "status",       header: "Estatus",     format: (v) => statusLabels[v] ?? v ?? "" },
    { key: "reference",    header: "Referencia" },
  ];
}

/**
 * Columnas CSV para el reporte de transferencias.
 * @param {Object} bankAccountsById
 * @param {Object} statusLabels
 */
export function transfersColumns(bankAccountsById, statusLabels) {
  return [
    { key: (r) => fmtDate(r.transferDate ?? r.createdAt), header: "Fecha" },
    { key: (r) => bankAccountsById[r.fromAccountId]?.name ?? r.fromAccountId ?? "", header: "Cuenta origen" },
    { key: (r) => bankAccountsById[r.toAccountId]?.name ?? r.toAccountId ?? "", header: "Cuenta destino" },
    { key: "amount",       header: "Monto",    format: fmtDecimal },
    { key: "currencyCode", header: "Moneda" },
    { key: "status",       header: "Estatus",  format: (v) => statusLabels[v] ?? v ?? "" },
    { key: (r) => r.reference ?? r.notes ?? "", header: "Referencia" },
  ];
}

/**
 * Columnas CSV para reportes CxC y CxP.
 * @param {Object} statusLabels
 * @param {(r: object) => number} pendingFn — función que calcula el pendiente
 */
export function receivablesPayablesColumns(statusLabels, pendingFn) {
  return [
    { key: (r) => r.reference ?? r.externalReference ?? "", header: "Referencia" },
    { key: "description",     header: "Descripción" },
    { key: (r) => r.counterpartyName ?? r.counterparty ?? "", header: "Contraparte" },
    { key: "amount",          header: "Monto",    format: fmtDecimal },
    { key: "amountPaid",      header: "Pagado",   format: fmtDecimal },
    { key: (r) => pendingFn(r), header: "Pendiente", format: (v) => parseFloat(v ?? "0").toFixed(2) },
    { key: "currencyCode",    header: "Moneda" },
    { key: "dueAt",           header: "Vencimiento", format: fmtDate },
    { key: "status",          header: "Estatus",  format: (v) => statusLabels[v] ?? v ?? "" },
  ];
}

/**
 * Columnas CSV para cortes de saldo (balance snapshots).
 * @param {Object} bankAccountsById
 */
export function snapshotsColumns(bankAccountsById) {
  return [
    { key: (r) => fmtDate(r.snapshotDate ?? r.recordedAt), header: "Fecha de corte" },
    { key: (r) => bankAccountsById[r.bankAccountId]?.name ?? r.bankAccountId ?? "", header: "Cuenta" },
    { key: (r) => bankAccountsById[r.bankAccountId]?.bankName ?? "", header: "Banco" },
    { key: (r) => r.currencyCode ?? bankAccountsById[r.bankAccountId]?.currencyCode ?? "MXN", header: "Moneda" },
    { key: "balance",  header: "Monto",   format: fmtDecimal },
    { key: "source",   header: "Origen" },
  ];
}
