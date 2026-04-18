/**
 * exportXlsx.js — Exportación a XLSX con estilos vía exceljs (import dinámico).
 *
 * Carga exceljs de forma lazy para no impactar el bundle inicial.
 * Estilos: header azul oscuro + texto blanco en negrita, filas alternas gris claro,
 *          freeze pane en fila 1, auto-fit de ancho de columna.
 *
 * Task origen: T-1608 (Fase 16 Bloque 2)
 * Decisión: import dinámico para evitar impacto en bundle inicial (~500KB).
 */

// ─── Tipos de columna ─────────────────────────────────────────────────────────

/**
 * @typedef {{ key: string | ((row: object) => unknown), header: string, type?: 'number'|'date'|'string', width?: number }} XlsxColumn
 * @typedef {{ name: string, columns: XlsxColumn[], rows: object[] }} XlsxSheet
 */

// ─── Estilos ──────────────────────────────────────────────────────────────────

const HEADER_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1E3A5F" },
};

const HEADER_FONT = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 10,
};

const ALT_ROW_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF4F6F8" },
};

const NUMBER_FMT = "#,##0.00";
const DATE_FMT   = "DD/MM/YYYY";

// ─── Calcular ancho de columna ────────────────────────────────────────────────

function estimateWidth(header, rows, key) {
  const headerLen = String(header).length;
  const maxDataLen = rows.reduce((max, row) => {
    const val = typeof key === "function" ? key(row) : row[key];
    return Math.max(max, String(val ?? "").length);
  }, 0);
  return Math.min(Math.max(headerLen, maxDataLen) + 2, 50);
}

// ─── Construir hoja ───────────────────────────────────────────────────────────

function buildWorksheet(wb, sheet) {
  const ws = wb.addWorksheet(sheet.name);

  // Definir columnas
  ws.columns = sheet.columns.map((col) => ({
    header: col.header,
    key: col.header,
    width: col.width ?? estimateWidth(col.header, sheet.rows, col.key),
  }));

  // Estilizar fila de encabezado
  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = { bottom: { style: "thin", color: { argb: "FF99AAC0" } } };
  });
  headerRow.height = 22;

  // Freeze pane en fila 1
  ws.views = [{ state: "frozen", ySplit: 1 }];

  // Auto-filtro en encabezados
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columns.length } };

  // Agregar filas de datos
  sheet.rows.forEach((rowData, idx) => {
    const values = sheet.columns.map((col) => {
      const raw = typeof col.key === "function" ? col.key(rowData) : rowData[col.key];
      if (col.type === "number") return parseFloat(raw ?? "0");
      if (col.type === "date" && raw) return new Date(raw);
      return raw ?? "";
    });

    const row = ws.addRow(values);

    // Fila alterna
    if (idx % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = ALT_ROW_FILL;
      });
    }

    // Formato por tipo de columna
    sheet.columns.forEach((col, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      if (col.type === "number") {
        cell.numFmt = NUMBER_FMT;
        cell.alignment = { horizontal: "right" };
      } else if (col.type === "date") {
        cell.numFmt = DATE_FMT;
      }
    });

    row.height = 18;
  });

  return ws;
}

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Exporta múltiples hojas a un archivo XLSX.
 *
 * @param {XlsxSheet[]} sheets
 * @param {string} filename — sin extensión ".xlsx"
 * @returns {Promise<void>}
 */
export async function exportToXlsx(sheets, filename) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();

  wb.creator = "AtlasERP";
  wb.created = new Date();

  for (const sheet of sheets) {
    buildWorksheet(wb, sheet);
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Helpers para construir sheets de cada reporte ────────────────────────────

/** Helper de formato de fecha ISO → string DD/MM/YYYY */
function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Sheet de movimientos para XLSX.
 * @param {object[]} rows
 * @param {Object} bankAccountsById
 * @param {Object} typeLabels
 * @param {Object} statusLabels
 * @param {string} [sheetName]
 */
export function movementsSheet(rows, bankAccountsById, typeLabels, statusLabels, sheetName = "Movimientos") {
  return {
    name: sheetName,
    columns: [
      { key: (r) => fmtDate(r.occurredAt),                       header: "Fecha",       type: "string" },
      { key: (r) => bankAccountsById[r.bankAccountId]?.name ?? "", header: "Cuenta",      type: "string" },
      { key: (r) => typeLabels[r.movementType] ?? r.movementType ?? "", header: "Tipo",   type: "string" },
      { key: "description",                                        header: "Descripción", type: "string" },
      { key: (r) => parseFloat(r.amount ?? "0"),                  header: "Monto",       type: "number" },
      { key: "currencyCode",                                       header: "Moneda",      type: "string", width: 10 },
      { key: (r) => statusLabels[r.status] ?? r.status ?? "",     header: "Estatus",     type: "string", width: 16 },
      { key: "reference",                                          header: "Referencia",  type: "string" },
    ],
    rows,
  };
}

/**
 * Sheet de totales por tipo para XLSX.
 * @param {object[]} movements
 * @param {Object} typeLabels
 */
export function totalsByTypeSheet(movements, typeLabels) {
  const byType = {};
  for (const m of movements) {
    const type = m.movementType ?? "UNKNOWN";
    byType[type] = (byType[type] ?? 0) + parseFloat(m.amount ?? "0");
  }

  return {
    name: "Totales",
    columns: [
      { key: "type",   header: "Tipo",   type: "string", width: 25 },
      { key: "total",  header: "Monto",  type: "number", width: 18 },
    ],
    rows: Object.entries(byType).map(([type, total]) => ({
      type: typeLabels[type] ?? type,
      total,
    })),
  };
}

/**
 * Sheet de transferencias para XLSX.
 * @param {object[]} rows
 * @param {Object} bankAccountsById
 * @param {Object} statusLabels
 */
export function transfersSheet(rows, bankAccountsById, statusLabels) {
  return {
    name: "Transferencias",
    columns: [
      { key: (r) => fmtDate(r.transferDate ?? r.createdAt),        header: "Fecha",          type: "string" },
      { key: (r) => bankAccountsById[r.fromAccountId]?.name ?? "", header: "Cuenta origen",   type: "string" },
      { key: (r) => bankAccountsById[r.toAccountId]?.name ?? "",   header: "Cuenta destino",  type: "string" },
      { key: (r) => parseFloat(r.amount ?? "0"),                   header: "Monto",           type: "number" },
      { key: "currencyCode",                                        header: "Moneda",          type: "string", width: 10 },
      { key: (r) => statusLabels[r.status] ?? r.status ?? "",      header: "Estatus",         type: "string", width: 14 },
      { key: (r) => r.reference ?? r.notes ?? "",                  header: "Referencia",      type: "string" },
    ],
    rows,
  };
}

/**
 * Sheet de detalle de CxC o CxP para XLSX.
 * @param {object[]} rows
 * @param {Object} statusLabels
 * @param {(r: object) => number} pendingFn
 * @param {string} sheetName
 */
export function cxcCxpDetailSheet(rows, statusLabels, pendingFn, sheetName = "Detalle") {
  return {
    name: sheetName,
    columns: [
      { key: (r) => r.reference ?? r.externalReference ?? "",      header: "Referencia",   type: "string" },
      { key: "description",                                         header: "Descripción",  type: "string" },
      { key: (r) => r.counterpartyName ?? r.counterparty ?? "",    header: "Contraparte",  type: "string" },
      { key: (r) => parseFloat(r.amount ?? "0"),                   header: "Monto",        type: "number" },
      { key: (r) => parseFloat(r.amountPaid ?? "0"),               header: "Pagado",       type: "number" },
      { key: (r) => pendingFn(r),                                  header: "Pendiente",    type: "number" },
      { key: "currencyCode",                                        header: "Moneda",       type: "string", width: 10 },
      { key: (r) => fmtDate(r.dueAt),                              header: "Vencimiento",  type: "string", width: 14 },
      { key: (r) => statusLabels[r.status] ?? r.status ?? "",      header: "Estatus",      type: "string", width: 14 },
    ],
    rows,
  };
}
