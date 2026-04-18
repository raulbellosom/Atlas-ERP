/**
 * exportPdf.js — Exportación a PDF con @react-pdf/renderer (import dinámico).
 *
 * Carga la librería de forma lazy para no impactar el bundle inicial (~1.2MB).
 * Layout: portrait A4. Fuente: Helvetica (soporta Latin-1 básico, incluida en PDF spec).
 *
 * Task origen: T-1609 (Fase 16 Bloque 2)
 */

import React from "react";

// ─── Paleta de estilos ────────────────────────────────────────────────────────

const COLORS = {
  headerBg:   "#1E3A5F",
  headerText: "#FFFFFF",
  altRow:     "#F4F6F8",
  border:     "#D1D9E0",
  text:       "#1A2533",
  muted:      "#6B7A8D",
  success:    "#15803D",
  error:      "#B91C1C",
};

// ─── Función de descarga de Blob ──────────────────────────────────────────────

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Formato de utilidades ────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

function formatMoney(amount, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency", currency, minimumFractionDigits: 2,
  }).format(parseFloat(amount ?? "0"));
}

// ─── Componentes PDF base (creados dinámicamente con la API de react-pdf) ─────

function createBaseComponents(R) {
  const { Document, Page, View, Text, StyleSheet } = R;

  const styles = StyleSheet.create({
    page: { fontFamily: "Helvetica", fontSize: 9, color: COLORS.text, paddingHorizontal: 32, paddingVertical: 28 },
    header: { marginBottom: 16 },
    headerTitle: { fontSize: 16, fontFamily: "Helvetica-Bold", color: COLORS.headerBg },
    headerMeta: { fontSize: 8, color: COLORS.muted, marginTop: 3 },
    headerLine: { borderBottomWidth: 1, borderBottomColor: COLORS.headerBg, marginTop: 8 },
    footer: { position: "absolute", bottom: 20, left: 32, right: 32, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.5, borderTopColor: COLORS.border, paddingTop: 4 },
    footerText: { fontSize: 7, color: COLORS.muted },
    tableHeader: { flexDirection: "row", backgroundColor: COLORS.headerBg, paddingVertical: 5, paddingHorizontal: 4, marginBottom: 0 },
    tableHeaderCell: { fontFamily: "Helvetica-Bold", fontSize: 7.5, color: COLORS.headerText },
    tableRow: { flexDirection: "row", paddingVertical: 3.5, paddingHorizontal: 4, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
    tableRowAlt: { backgroundColor: COLORS.altRow },
    tableCell: { fontSize: 8 },
    section: { marginBottom: 14 },
    sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: 6, color: COLORS.headerBg },
  });

  function ReportHeader({ title, period, generatedBy, orgName }) {
    return (
      React.createElement(View, { style: styles.header },
        orgName && React.createElement(Text, { style: { fontSize: 8, color: COLORS.muted, marginBottom: 2 } }, orgName),
        React.createElement(Text, { style: styles.headerTitle }, title),
        React.createElement(Text, { style: styles.headerMeta },
          [period && `Periodo: ${period}`, `Generado: ${formatDate(new Date().toISOString())}`, generatedBy && `Por: ${generatedBy}`]
            .filter(Boolean).join("  ·  "),
        ),
        React.createElement(View, { style: styles.headerLine }),
      )
    );
  }

  function ReportFooter() {
    return (
      React.createElement(View, { style: styles.footer, fixed: true },
        React.createElement(Text, { style: styles.footerText }, "Generado por AtlasERP"),
        React.createElement(Text, { style: styles.footerText, render: ({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}` }),
      )
    );
  }

  function ReportTable({ columns, rows, title }) {
    const colFlex = columns.map((c) => c.flex ?? 1);
    return (
      React.createElement(View, { style: styles.section },
        title && React.createElement(Text, { style: styles.sectionTitle }, title),
        React.createElement(View, { style: styles.tableHeader },
          columns.map((col, i) =>
            React.createElement(Text, { key: i, style: [styles.tableHeaderCell, { flex: colFlex[i], textAlign: col.align ?? "left" }] }, col.header),
          ),
        ),
        rows.map((row, ri) =>
          React.createElement(View, { key: ri, style: [styles.tableRow, ri % 2 === 1 && styles.tableRowAlt] },
            columns.map((col, ci) => {
              const val = typeof col.key === "function" ? col.key(row) : row[col.key];
              const display = col.format ? col.format(val, row) : String(val ?? "—");
              return React.createElement(Text, {
                key: ci,
                style: [styles.tableCell, { flex: colFlex[ci], textAlign: col.align ?? "left" }],
              }, display);
            }),
          ),
        ),
      )
    );
  }

  return { Document, Page, styles, ReportHeader, ReportFooter, ReportTable };
}

// ─── Función genérica de export PDF ──────────────────────────────────────────

/**
 * Genera y descarga un PDF con múltiples secciones de tabla.
 *
 * @param {{
 *   title: string,
 *   period?: string,
 *   generatedBy?: string,
 *   orgName?: string,
 *   sections: Array<{ title?: string, columns: object[], rows: object[] }>
 * }} opts
 * @param {string} filename — sin extensión
 */
export async function exportToPdf(opts, filename) {
  const R = await import("@react-pdf/renderer");
  const { Document, Page, pdf } = R;
  const { ReportHeader, ReportFooter, ReportTable, styles } = createBaseComponents(R);

  const doc = React.createElement(Document,
    { title: opts.title, language: "es" },
    React.createElement(Page, { size: "A4", orientation: "portrait", style: styles.page },
      React.createElement(ReportHeader, {
        title: opts.title,
        period: opts.period,
        generatedBy: opts.generatedBy,
        orgName: opts.orgName,
      }),
      ...opts.sections.map((s, i) =>
        React.createElement(ReportTable, { key: i, title: s.title, columns: s.columns, rows: s.rows }),
      ),
      React.createElement(ReportFooter),
    ),
  );

  const blob = await pdf(doc).toBlob();
  downloadBlob(blob, `${filename}.pdf`);
}

// ─── Helpers de columnas para cada reporte ────────────────────────────────────

export function movementsPdfColumns(bankAccountsById, typeLabels, statusLabels) {
  return [
    { key: (r) => formatDate(r.occurredAt), header: "Fecha",       flex: 1.2 },
    { key: (r) => bankAccountsById[r.bankAccountId]?.name ?? "—", header: "Cuenta", flex: 2 },
    { key: (r) => typeLabels[r.movementType] ?? r.movementType ?? "—", header: "Tipo", flex: 1.8 },
    { key: "description", header: "Descripción", flex: 2.5 },
    { key: (r) => formatMoney(r.amount, r.currencyCode), header: "Monto", flex: 1.5, align: "right" },
    { key: (r) => statusLabels[r.status] ?? r.status ?? "—", header: "Estatus", flex: 1.3 },
  ];
}

export function transfersPdfColumns(bankAccountsById, statusLabels) {
  return [
    { key: (r) => formatDate(r.transferDate ?? r.createdAt), header: "Fecha",    flex: 1.2 },
    { key: (r) => bankAccountsById[r.fromAccountId]?.name ?? "—", header: "Origen",  flex: 2 },
    { key: (r) => bankAccountsById[r.toAccountId]?.name ?? "—",   header: "Destino", flex: 2 },
    { key: (r) => formatMoney(r.amount, r.currencyCode), header: "Monto",  flex: 1.5, align: "right" },
    { key: (r) => statusLabels[r.status] ?? r.status ?? "—", header: "Estatus", flex: 1.3 },
  ];
}

export function cxcCxpPdfColumns(statusLabels, pendingFn) {
  return [
    { key: (r) => r.reference ?? r.externalReference ?? "—", header: "Referencia", flex: 1.5 },
    { key: "description", header: "Descripción", flex: 2.5 },
    { key: (r) => formatMoney(r.amount, r.currencyCode),      header: "Monto",       flex: 1.3, align: "right" },
    { key: (r) => formatMoney(pendingFn(r), r.currencyCode),  header: "Pendiente",   flex: 1.3, align: "right" },
    { key: (r) => formatDate(r.dueAt),                         header: "Vence",       flex: 1.2 },
    { key: (r) => statusLabels[r.status] ?? r.status ?? "—",  header: "Estatus",     flex: 1.2 },
  ];
}
